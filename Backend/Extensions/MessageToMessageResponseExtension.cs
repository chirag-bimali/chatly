using Backend.Mappers;
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
        return new MessageResponseDto
        {
            // public string? Id { get; set; }
            // public string? ContactId { get; set; }
            // public string? Content { get; set; }
            // public string? SenderId { get; set; }
            // public ForwardMessageResponseDto? ForwardMessage { get; set; }
            // public ReplyMessageResponseDto? ReplyMessage { get; set; }
            Id = message.Id,
            ContactId = message.ContactId,
            Contact = message.Contact?.ToContactsDtoFromContact(),
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt,
            ForwardMessage = message.ForwardMessage?.ToForwardMessageResponseDto(),
            ReplyMessage = message.ReplyMessage?.ToReplyMessageResponseDto()
        };
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