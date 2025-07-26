using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Backend.Mappers;
using Chatly.DTO.Accounts;
using Chatly.DTO.Contacts;
using Chatly.DTO.Messages;
using Chatly.Extensions;
using Chatly.Models;

namespace Chatly.Mappers
{
    public static class ContactsMapper
    {
        public static ContactDto ToContactsDtoFromContact(this Contact data)
        {
            var msgDto = new MessageResponseDto
            {
                Id = data.Message?.Id,
                ContactId = data.Message?.ContactId,
                Content = data.Message?.Content,
                SenderId = data.Message?.SenderId,
                CreatedAt = data.Message?.CreatedAt,
                ForwardMessage = data.Message?.ForwardMessage?.ToForwardMessageResponseDto(),
                ReplyMessage = data.Message?.ReplyMessage?.ToReplyMessageResponseDto()
            };


            return new ContactDto
            {
                Id = data.Id,

                UserId = data.UserId,
                User = data.User?.ToUserDtoFromUser(),

                ContactId = data.ContactId,
                ContactUser = data.ContactUser?.ToUserDtoFromUser(),

                ActorId = data.ActorId,
                Actor = data.Actor?.ToUserDtoFromUser(),

                MessageId = data.MessageId,
                Message = msgDto,

                Status = data.Status.ToString(),
                CreatedAt = data.CreatedAt,
                Mutated = data.Mutated,
                Archived = data.Archived,
                UnreadCount = data.UnreadCount
            };
        }
    }
}