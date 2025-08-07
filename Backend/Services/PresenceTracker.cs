using StackExchange.Redis;

namespace Chatly.Services;

public class PresenceTracker
{
    private readonly IDatabase _db;
    private readonly string OnlineUsersKey = "online-users";

    public PresenceTracker(RedisService redisService)
    {
        _db = redisService.Db;
    }

    public async Task MarkOnline(string userId)
    {
        await _db.SetAddAsync(OnlineUsersKey, userId);
    }
}