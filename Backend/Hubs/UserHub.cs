using Chatly.Interfaces.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace Chatly.Hubs;

public class UserHub : Hub
{
    private IUserRepository _userRepository;
    public UserHub(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async override Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        string userId = Context.UserIdentifier ?? Context?.User?.Identity?.Name ?? connectionId;
        
        
        // 1. Handle change status in db
        await _userRepository.UpdateUserAsync(userId: userId, isOnline: true);
    

        // 2. Broadcast to all contact users
        await base.OnConnectedAsync();
    }
}