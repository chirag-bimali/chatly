using System.Text;
using Chatly.Data;
using Chatly.DTO;
using Chatly.Hubs;
using Chatly.Interfaces.Repositories;
using Chatly.Interfaces.Services;
using Chatly.Interfaces.Utilities;
using Chatly.Utilities;
using Chatly.Models;
using Chatly.Repositories;
using Chatly.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Reflection.Metadata.Ecma335;

var builder = WebApplication.CreateBuilder(args);


var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("JWTKey is required.");
}

var encodedKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];


if (string.IsNullOrEmpty(jwtIssuer) && string.IsNullOrEmpty(jwtAudience))
{
    throw new Exception("Jwt configuration settings is missing or invalid.");
}

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();


builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = encodedKey
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    (
                        path.StartsWithSegments("/hubs")
                    )
                   )
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    });

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// SETUP REDIS SERVER

var redisConnectionString = builder.Configuration.GetConnectionString("RedisConnection");

if (string.IsNullOrEmpty(redisConnectionString))
{
    throw new Exception("Redis connection string is required.");
}
;

builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
{
    var redis = ConnectionMultiplexer.Connect(redisConnectionString);
    if (redis.IsConnected)
        Console.WriteLine("Connected to Redis server.");
    else
        throw new Exception("Failed to connect to Redis server.");

    return redis;
});



builder.Services.AddScoped<IPasswordFormatValidator, PasswordFormatValidator>();
builder.Services.AddScoped<ITokenService, TokenService>();

// REPOSITORIES
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();

// REDIS REPOSITORIES
builder.Services.AddScoped<IPresenceRepository, PresenceRepository>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials();
    });
});

// USER PROFILE PICTURE STORAGE SETUP
var userProfilePathRelative = builder.Configuration["Storage:UserProfilePicturesPath"];
Console.WriteLine($"userProfilePathRelative: {userProfilePathRelative}");
if (string.IsNullOrEmpty(userProfilePathRelative))
{
    throw new Exception("UserProfilePath is missing or invalid.");
}

var userProfilePath = builder.Configuration["Storage:UserProfilePicturesPath"];
if (string.IsNullOrEmpty(userProfilePath)) throw new Exception($"Profile Picture Path is missing.");
Console.WriteLine($"userProfilePath: {userProfilePath}");
if (!Directory.Exists(userProfilePath))
{
    Directory.CreateDirectory(userProfilePath);
}


// BUILD APP
var app = builder.Build();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Waiting for database to be ready...");

        // Wait for SQL Server to be ready with retries
        var maxAttempts = 10;
        var delay = TimeSpan.FromSeconds(5);

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                logger.LogInformation($"Database connection attempt {attempt}/{maxAttempts}");

                // Test connection first
                await context.Database.CanConnectAsync();

                // Create database if it doesn't exist
                await context.Database.EnsureCreatedAsync();

                logger.LogInformation("Database is ready and created successfully.");
                break;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(ex, $"Database connection attempt {attempt} failed. Retrying in {delay.TotalSeconds} seconds...");
                await Task.Delay(delay);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to initialize database after all retry attempts.");
        throw;
    }
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();

//  Assign Access token for the specified hub routes in jwtBearerEvents.
app.MapHub<UserHub>("hubs/users");
app.MapHub<ContactHub>("hubs/contacts");
app.MapHub<MessageHub>("hubs/messages");

app.MapFallback(() => Results.NotFound(ApiResponse<object>.ErrorResponse(
    "404 Not Found",
    400,
    "NOT_IMPLEMENTED",
    "The route that you are trying to access is not implemented.",
    new Dictionary<string, List<string>>
    {
        { "Server", new List<string> { "The path is invalid" } }
    }
)));
app.Run();