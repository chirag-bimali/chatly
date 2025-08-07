using Chatly.Interfaces.Repositories;
using Chatly.Services;
using Microsoft.AspNetCore.SignalR;

namespace Chatly.Hubs;

public class UserHub : Hub
{
    private IUserRepository _userRepository;
    private PresenceTracker _presenceTracker;
    public UserHub(IUserRepository userRepository, PresenceTracker presenceTracker)
    {
        _userRepository = userRepository;
        _presenceTracker = presenceTracker;
    }

    public override async Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;
        
        
        // 1. Handle change status in db
        // await _userRepository.UpdateUserAsync(userId: userId, isOnline: true);
        await _presenceTracker.MarkOnline(userId);
    

        // 2. Broadcast to all contact users
        await base.OnConnectedAsync();
    }
}