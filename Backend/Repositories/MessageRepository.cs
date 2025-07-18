using Chatly.Data;
using Chatly.Exceptions;
using Chatly.Interfaces.Repositories;
using Chatly.Models;
using Microsoft.AspNetCore.Http.Connections;
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

        var contact = await _dbContext.Contacts.FirstOrDefaultAsync(x => x.Id == contactId);
        if (contact == null) throw new NotFoundException("Contact not found");

        var sender = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == senderId);
        if (sender == null) throw new NotFoundException("Sender not found");

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
            await _dbContext.Messages.Include(f => f.Sender).FirstOrDefaultAsync(x => x.Id == forwardMessageId);

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


        await _dbContext.Messages.AddAsync(newMessage);
        await _dbContext.SaveChangesAsync();
        newMessage.ForwardMessage = newforwardMessage;
        newMessage.ReplyMessage = newReplyMessage;
        newMessage.Contact = contact;
        return newMessage;
    }

    public async Task<Message> CreateManyAsync(List<string?> contactIds, string? senderId, string? content,
        string? replyMessageId = null,
        string? forwardMessageId = null)
    {
        if (contactIds.Count == 0)
        {
            throw new ApplicationArgumentException("The contacts cannot be empty", nameof(contactIds));
        }

        var contacts = await _dbContext.Contacts
            .Include(c => c.User)
            .Include(c => c.ContactUser)
            .Where(c => contactIds.Contains(c.Id))
            .Where(c => c.UserId == senderId || c.ContactId == senderId).ToListAsync();

        //  let user know if user is trying to access other contacts and
        // block sending a message completely

        // var forwardMessage = await _dbContext.ForwardMessages.

        var messages = contacts.Select<Contact, Message>(c =>
        {
            var messageId = Guid.NewGuid().ToString();
            return new Message
            {
                Id = messageId,
                ContactId = c.Id,
                // Content = forwardMessageId != null ? content : ,
                ForwardMessage = new ForwardMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    MessageId = messageId,
                }
            };
        });
        return new Message();
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
            .Include(x => x.ReplyMessage)
            .ThenInclude(r => r != null ? r.PreviousSender : null)
            .OrderByDescending(c => c.CreatedAt)
            .Where(c => c.ContactId == contactId).Skip(skip).Take(take)
            .OrderBy(c => c.CreatedAt);
        Console.WriteLine(await queryable.CountAsync());
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