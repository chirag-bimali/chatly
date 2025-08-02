using Backend.Mappers;
using Chatly.DTO.Contacts;
using Chatly.DTO.Messages;
using Chatly.Mappers;
using Chatly.Models;

namespace Chatly.Extensions;

public static class MessageToMessageResponseExtension
{
    static public List<MessageResponseDto> ToListMessageResponseDto(this List<Message> messageResponseDtos)
    {
        return messageResponseDtos.Select(m => m.ToMessageResponseDto()).ToList();
    }

    static public MessageResponseDto ToMessageResponseDto(this Message message)
    {
        var msgDto = new MessageResponseDto
        {
            Id = message.Id,
            ContactId = message.ContactId,
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt,
            ForwardMessage = message.ForwardMessage?.ToForwardMessageResponseDto(),
            ReplyMessage = message.ReplyMessage?.ToReplyMessageResponseDto()
        };
        var newContact = new ContactDto
        {
            Id = message.Contact?.Id,

            UserId = message.Contact?.UserId,
            User = message.Contact?.User?.ToUserDtoFromUser(),

            ContactId = message.Contact?.ContactId,
            ContactUser = message.Contact?.ContactUser?.ToUserDtoFromUser(),

            ActorId = message.Contact?.ActorId,
            Actor = message.Contact?.Actor?.ToUserDtoFromUser(),

            MessageId = message.Contact?.MessageId,
            // Message = msgDto,

            Status = message.Contact?.Status.ToString(),
            CreatedAt = message.Contact?.CreatedAt,
            Mutated = message.Contact?.Mutated ?? false,
            Archived = message.Contact?.Archived ?? false,
            UnreadCount = message.Contact?.UnreadCount ?? 0
        };
        msgDto.Contact = newContact;
        return msgDto;
    }

    static public ForwardMessageResponseDto ToForwardMessageResponseDto(this ForwardMessage message)
    {
        return new ForwardMessageResponseDto
        {
            Id = message.Id,
            PreviousContactId = message.PreviousContactId,
            PreviousSender = message.PreviousSender?.ToUserDtoFromUser(),
            SubContent = message.SubContent
        };
    }

    static public ReplyMessageResponseDto ToReplyMessageResponseDto(this ReplyMessage message)
    {
        return new ReplyMessageResponseDto
        {
            Id = message.Id,
            PreviousSenderId = message.PreviousSenderId,
            PreviousContent = message.PreviousContent,
            PreviousSender = message.PreviousSender?.ToUserDtoFromUser()
        };
    }
}