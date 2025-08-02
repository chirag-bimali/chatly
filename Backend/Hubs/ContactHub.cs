using Chatly.Data;
using Chatly.DTO;
using Chatly.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Chatly.Hubs;

[Authorize]
public class ContactHub : Hub
{
  private readonly IContactRepository _contactRepository;
  public ContactHub(IContactRepository contactRepository)
  {
    _contactRepository = contactRepository;
  }
  public override Task OnConnectedAsync()
  {
    string connectionId = Context.ConnectionId;
    string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;

    // 1. Handle change status in db

    // 2. Broadcast to all contact users

    return base.OnConnectedAsync();
  }
}