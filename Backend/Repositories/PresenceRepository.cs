using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Chatly.Interfaces.Repositories;
using StackExchange.Redis;

namespace Chatly.Repositories
{
    public class PresenceRepository : IPresenceRepository
    {
        private readonly IDatabase _db;
        private const string OnlineUsersKey = "online_users";
        public PresenceRepository(IConnectionMultiplexer db)
        {
            _db = db.GetDatabase();
        }
        public Task AddUserOnlineAsync(string userId)
        {
            return _db.SetAddAsync(OnlineUsersKey, userId);
        }

        public Task RemoveUserOnlineAsync(string userId)
        {
            return _db.SetRemoveAsync(OnlineUsersKey, userId);
        }

        public Task<bool> IsUserOnlineAsync(string userId)
        {
            return _db.SetContainsAsync(OnlineUsersKey, userId);
        }

        public Task SetLastSeenAsync(string userId, DateTime lastSeen)
        {
            return _db.StringSetAsync($"last_seen:{userId}", lastSeen.ToString("o"));
        }

        public Task<IEnumerable<string>> GetOnlineUsersAsync()
        {
            return _db.SetMembersAsync(OnlineUsersKey)
                      .ContinueWith(t => t.Result.Select(v => v.ToString()));
        }
    }
}