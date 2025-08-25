using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Chatly.Interfaces.Repositories
{
    public interface IPresenceRepository
    {

        Task AddUserOnlineAsync(string userId);
        Task RemoveUserOnlineAsync(string userId);
        Task<bool> IsUserOnlineAsync(string userId);
        Task SetLastSeenAsync(string userId, DateTime lastSeen);
        Task<IEnumerable<string>> GetOnlineUsersAsync();

    }
}