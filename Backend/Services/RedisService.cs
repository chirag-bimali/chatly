using StackExchange.Redis;

namespace Chatly.Services;

public class RedisService
{
    private readonly ConnectionMultiplexer _redis;
    public IDatabase Db => _redis.GetDatabase();

    public RedisService(IConfiguration config)
    {
        var connectionString = config.GetConnectionString("RedisConnection") ?? "localhost";
        _redis = ConnectionMultiplexer.Connect(connectionString);
        if (_redis.IsConnected)
        {
            Console.WriteLine("Redis Connected Successfully");
        }
        else throw new Exception("Could not connect to the redis server");
    }
}