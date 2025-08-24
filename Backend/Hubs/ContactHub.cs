using Chatly.Data;
using Chatly.DTO;
using Chatly.DTO.Contacts;
using Chatly.Interfaces.Repositories;
using Chatly.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Chatly.Hubs;

[Authorize]
public class ContactHub : Hub
{
    private IContactRepository _contactRepository;

    public ContactHub(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public override async Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;

        //  Broadcast to all contact users
        int page = 1;
        int pageSize = 50;
        var (contacts, counts) = await _contactRepository.GetAllAsync(
            userId, page: page, pageSize: pageSize);


        foreach (var contact in contacts)
        {
            var contactUser = contact.UserId == userId ? contact.ContactId : contact.UserId;
            if (string.IsNullOrEmpty(contactUser)) continue;
            await Clients.User(contactUser).SendAsync("ActiveUser",
                ApiResponse<ContactDto>.SuccessResponse(contact.ToContactsDtoFromContact()));
        }

        if (pageSize < counts)
        {
            (contacts, _) = await _contactRepository.GetAllAsync(userId, page + 1, pageSize: (counts - pageSize));

            foreach (var contact in contacts)
            {
                var contactUser = contact.UserId == userId ? contact.ContactId : contact.UserId;
                if (string.IsNullOrEmpty(contactUser)) continue;
                await Clients.User(contactUser).SendAsync("ActiveUser",
                    ApiResponse<ContactDto>.SuccessResponse(contact.ToContactsDtoFromContact()));
            }
        }


        await base.OnConnectedAsync();
    }
}