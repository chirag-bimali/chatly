using Chatly.Data;
using Chatly.Exceptions;
using Chatly.Interfaces.Repositories;
using Chatly.Models;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;

namespace Chatly.Repositories;

public class MessageRepository : IMessageRepository
{
    ApplicationDbContext _dbContext;

    public MessageRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Message> CreateAsync(string? contactId,
        string? senderId,
        string? content,
        string? replyMessageId = null,
        string? forwardMessageId = null)
    {
        if (string.IsNullOrEmpty(contactId))
            throw new ApplicationArgumentException("ContactId cannot be null or empty.", nameof(contactId));

        if (string.IsNullOrEmpty(senderId))
            throw new ApplicationArgumentException("SenderId cannot be null or empty.", nameof(senderId));

        if (content == null)
            throw new ApplicationArgumentException("Content cannot be null", nameof(content));

        var contact = await _dbContext.Contacts.FirstOrDefaultAsync(x => x.Id == contactId) ??
                      throw new NotFoundException("Contact not found");

        if (contact.Status == ContactStatus.Blocked)
        {
            throw new ConflictException("You are blocked");
        }

        var sender = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == senderId) ??
                     throw new NotFoundException("Sender not found");

        if (!(contact.ContactId == senderId || contact.UserId == senderId))
        {
            throw new ApplicationUnauthorizedAccessException("You are not authorized to access this contact");
        }

        var replyToMessage =
            replyMessageId != null ? _dbContext.Messages.FirstOrDefault(x => x.Id == replyMessageId) : null;

        if (
            replyToMessage != null &&
            replyToMessage.ContactId != contact.Id
        )
        {
            throw new ConflictException("Cannot reply message to a different contact");
        }

        var messageToBeForwarded =
            await _dbContext.Messages
                .Include(f => f.Sender)
                .Include(f => f.Contact)
                .ThenInclude(c => c != null ? c.User : null)
                .Include(f => f.Contact)
                .ThenInclude(c => c != null ? c.ContactUser : null)
                .FirstOrDefaultAsync(x => x.Id == forwardMessageId);

        if (messageToBeForwarded != null &&
            messageToBeForwarded.ContactId == contact.Id
           )
        {
            throw new ConflictException("Cannot forward message to a same contact");
        }

        if (messageToBeForwarded != null)
        {
            var previousContact =
                await _dbContext.Contacts.FirstOrDefaultAsync(x => x.Id == messageToBeForwarded.ContactId);
            if (previousContact == null) throw new NotFoundException("Contact not found");
            Console.WriteLine(previousContact.ContactId);
            Console.WriteLine(previousContact.UserId);
            _ = previousContact.ContactId == senderId || previousContact.UserId == senderId
                ? true
                : throw new ApplicationUnauthorizedAccessException("Cannot forward message from unauthorized contact");
        }

        Message newMessage = new Message
        {
            Id = Guid.NewGuid().ToString(),
            ContactId = contact.Id,
            SenderId = sender.Id,
            Sender = sender,
            Content = content,
            CreatedAt = DateTime.Now,
        };
        ReplyMessage? newReplyMessage = null;
        ForwardMessage? newforwardMessage = null;


        if (replyToMessage != null)
        {
            newReplyMessage = new ReplyMessage
            {
                Id = Guid.NewGuid().ToString(),
                MessageId = newMessage.Id,
                PreviousContent = replyToMessage.Content,
                PreviousSenderId = replyToMessage.SenderId,
                PreviousSender = replyToMessage.Sender,
            };
            newMessage.IsReply = true;
            await _dbContext.ReplyMessages.AddAsync(newReplyMessage);
        }

        if (messageToBeForwarded != null)
        {
            newforwardMessage = new ForwardMessage
            {
                Id = Guid.NewGuid().ToString(),
                MessageId = newMessage.Id,
                SubContent = content,
                PreviousContactId = messageToBeForwarded.ContactId,
                PreviousSenderId = messageToBeForwarded.SenderId,
                PreviousSender = messageToBeForwarded.Sender,
            };
            newMessage.Content = messageToBeForwarded.Content;
            newMessage.ContactId = contactId;
            newMessage.IsForwarded = true;
            await _dbContext.ForwardMessages.AddAsync(newforwardMessage);
        }


        contact.MessageId = newMessage.Id;
        contact.Message = newMessage;

        await _dbContext.Messages.AddAsync(newMessage);
        _dbContext.Contacts.Update(contact);
        await _dbContext.SaveChangesAsync();
        newMessage.ForwardMessage = newforwardMessage;
        newMessage.ReplyMessage = newReplyMessage;
        newMessage.Contact = contact;
        return newMessage;
    }

    public async Task<List<Message>> CreateManyAsync(List<string?>? contactIds, string? senderId, string? content,
        string? replyMessageId = null,
        string? forwardMessageId = null)
    {
        if (contactIds == null)
            throw new ApplicationArgumentException("The contact list cannot be null", nameof(contactIds));

        if (contactIds.Count == 0)
        {
            throw new ApplicationArgumentException("The contacts cannot be empty", nameof(contactIds));
        }

        if (replyMessageId != null && forwardMessageId != null)
            throw new ApplicationArgumentException("One of the field must be null", nameof(replyMessageId)).AddParam(
                nameof(forwardMessageId));



        var forwardMessage = forwardMessageId != null
            ? await _dbContext.Messages
                .Include(m => m.Contact)
                .ThenInclude(c => c != null ? c.User : null)
                .Include(m => m.Contact)
                .ThenInclude(c => c != null ? c.ContactUser : null)
                .Include(m => m.Sender)
                .Where(m => m.Contact != null && (m.Contact.UserId == senderId || m.Contact.ContactId == senderId))
                .FirstOrDefaultAsync(m => m.Id == forwardMessageId)
            : null;
        if (!string.IsNullOrEmpty(forwardMessageId) && forwardMessage == null)
        {
            throw new NotFoundException("Message to be forwarded  not found");
        }

        var replyMessage = replyMessageId != null
            ? await _dbContext.Messages
                .Include(m => m.Contact)
                .Include(m => m.Sender)
                .Where(m => m.Contact != null && (m.Contact.UserId == senderId || m.Contact.ContactId == senderId))
                .FirstOrDefaultAsync(m => m.Id == replyMessageId)
            : null;

        if ((!string.IsNullOrEmpty(replyMessageId)) && replyMessage == null)
        {
            throw new NotFoundException("Message to be reply not found");
        }


        var contacts = await _dbContext.Contacts
            .Include(c => c.User)
            .Include(c => c.ContactUser)
            .Where(c => forwardMessage == null || forwardMessage.ContactId != c.Id)
            .Where(c => replyMessage == null || replyMessage.ContactId == c.Id)
            .Where(c => contactIds.Contains(c.Id))
            .Where(c => c.UserId == senderId || c.ContactId == senderId).ToListAsync();

        //  let user know if user is trying to access other contacts and
        // block sending a message completely
        if (contacts.Count == 0) throw new NotFoundException("Contacts not found from given set");


        var messages = contacts.Select<Contact, Message>(c =>
        {
            var messageId = Guid.NewGuid().ToString();

            var newMsg = new Message
            {
                Id = messageId,
                ContactId = c.Id,
                Contact = c,
                Content = forwardMessage == null ? content : forwardMessage.Content,
                CreatedAt = DateTime.Now,
                SenderId = senderId,
                IsForwarded = forwardMessage != null,
                IsReply = replyMessage != null,
                Read = false,
                ForwardMessage = forwardMessage == null
                    ? null
                    : new ForwardMessage
                    {
                        Id = Guid.NewGuid().ToString(),
                        MessageId = messageId,
                        SubContent = content,
                        PreviousContact = forwardMessage?.Contact,
                        PreviousContactId = forwardMessage?.ContactId,
                        PreviousSender = forwardMessage?.Sender,
                        PreviousSenderId = forwardMessage?.SenderId,
                    },
                ReplyMessage = replyMessage == null
                    ? null
                    : new ReplyMessage
                    {
                        Id = Guid.NewGuid().ToString(),
                        MessageId = messageId,
                        PreviousContent = replyMessage.Content,
                        PreviousSenderId = replyMessage.SenderId,
                        PreviousSender = replyMessage?.Sender
                    }
            };
            newMsg.Contact.MessageId = messageId;
            newMsg.Contact.Message = newMsg;


            return newMsg;
        }).ToList();

        var addMessages = _dbContext.Messages.AddRangeAsync(messages);
        Task? addForwardMessages = null;
        if (forwardMessage != null)
        {
            var forwarding = messages.Select(m => m.ForwardMessage ?? new ForwardMessage()
                )
                .ToList();
            addForwardMessages = _dbContext.ForwardMessages.AddRangeAsync(forwarding);
        }

        Task? addReplyMessages = null;
        if (replyMessage != null)
        {
            var replying = messages.Select(m => m.ReplyMessage ?? new ReplyMessage()
                )
                .ToList();
            addReplyMessages = _dbContext.ReplyMessages.AddRangeAsync(replying);
        }

        if (addForwardMessages != null) await addForwardMessages;
        if (addReplyMessages != null) await addReplyMessages;


        var saved = await _dbContext.SaveChangesAsync();
        foreach (var m in messages)
        {
            await _dbContext.Contacts
                .Where(c => c.Id == m.ContactId)
                .ExecuteUpdateAsync(setter =>
                    setter.SetProperty(c => c.MessageId, c => m.Id)
                );
        }


        return messages;
    }

    public async Task<(List<Message>, int)> GetAllAsync(
        string? contactId,
        string? userId,
        int skip = 0,
        int take = 10
    )
    {
        if (skip < 0)
        {
            skip = 0;
        }

        if (take < 1)
        {
            take = 1;
        }

        var contact = await _dbContext.Contacts.FirstOrDefaultAsync(x => x.Id == contactId);
        if (contact == null) throw new NotFoundException("Contact not found");
        if (!(contact.ContactId == userId || contact.UserId == userId))
            throw new ApplicationUnauthorizedAccessException("You are not authorized to access this contact");
        var count = await _dbContext.Messages.Where(x => x.ContactId == contactId).CountAsync();
        var queryable = _dbContext.Messages
            .Include(x => x.ForwardMessage)
            .ThenInclude(f => f != null ? f.PreviousSender : null)
            .Include(x => x.ForwardMessage)
            .ThenInclude(f => f != null ? f.PreviousContact : null)
            .ThenInclude(c => c != null ? c.User : null)
            .Include(x => x.ForwardMessage)
            .ThenInclude(f => f != null ? f.PreviousContact : null)
            .ThenInclude(c => c != null ? c.ContactUser : null)
            .Include(x => x.ReplyMessage)
            .ThenInclude(r => r != null ? r.PreviousSender : null)
            .OrderByDescending(c => c.CreatedAt)
            .Where(c => c.ContactId == contactId).Skip(skip).Take(take);
        // .OrderBy(c => c.CreatedAt);
        return (await queryable.ToListAsync(), count);
    }

    public async Task<Message> EditMessageAsync(
        string messageId,
        string? senderId,
        string? content
    )
    {
        var sender = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == senderId);
        if (sender == null) throw new NotFoundException("Sender not found");

        var message = await _dbContext.Messages
            .Include(m => m.Contact)
            .Include(m => m.ForwardMessage)
            .FirstOrDefaultAsync(x => x.Id == messageId);
        if (message == null) throw new NotFoundException("Message not found");

        if (message.SenderId != senderId)
        {
            throw new ApplicationUnauthorizedAccessException("You are not authorized to edit this message");
        }

        if (message.IsReply || !message.IsForwarded)
        {
            message.Content = content ?? message.Content;
            _dbContext.Messages.Update(message);
        }

        if (message.IsForwarded)
        {
            if (message.ForwardMessage == null)
                throw new NotFoundException("IsForward is true but message not found");
            message.ForwardMessage.SubContent = content ?? message.ForwardMessage.SubContent;
            _dbContext.ForwardMessages.Update(message.ForwardMessage);
        }

        _dbContext.Messages.Update(message);
        await _dbContext.SaveChangesAsync();
        return message;
    }

    public async Task<Message> DeleteMessageAsync(string? messageId, string? userId)
    {
        if (userId == null)
            throw new ApplicationUnauthorizedAccessException("Login to delete message");
        if (messageId == null)
            throw new ApplicationArgumentException("MessageId cannot be null", nameof(messageId));

        var message = await _dbContext.Messages.Include(m => m.Contact).FirstOrDefaultAsync(x => x.Id == messageId);
        if (message == null) throw new NotFoundException("Message not found");
        if (message.SenderId != userId)
            throw new ApplicationUnauthorizedAccessException("You are not authorized to delete this message");

        _dbContext.Messages.Remove(message);
        await _dbContext.SaveChangesAsync();
        return message;
    }
}