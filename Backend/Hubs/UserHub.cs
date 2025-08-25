using Chatly.Interfaces.Repositories;
using Chatly.Services;
using Microsoft.AspNetCore.SignalR;

namespace Chatly.Hubs;

public class UserHub : Hub
{
    private IUserRepository _userRepository;
    private IPresenceRepository _presenceRepository;

    public UserHub(IUserRepository userRepository, IPresenceRepository presenceRepository)
    {
        _userRepository = userRepository;
        _presenceRepository = presenceRepository;
    }

    public override async Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;


        // 1. Handle change status in db
        await _presenceRepository.AddUserOnlineAsync(userId);
        await _presenceRepository.SetLastSeenAsync(userId, DateTime.UtcNow);

        // 2. Broadcast to all contact users
        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string connectionId = Context.ConnectionId;
        string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;

        // 1. Handle change status in db
        await _presenceRepository.RemoveUserOnlineAsync(userId);
        await _presenceRepository.SetLastSeenAsync(userId, DateTime.UtcNow);

        // 2. Broadcast to all contact users
        await base.OnDisconnectedAsync(exception);
    }
}