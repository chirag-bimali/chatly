# Chatly — Technical Overview

A real-time chat application with a .NET 8 backend and React 19 frontend, containerized via Docker Compose.

---

## Tools & Technologies

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 8** (Web API) | HTTP API layer |
| **Entity Framework Core 8** + SQL Server | ORM and data persistence |
| **ASP.NET Core Identity** | User management (password hashing, token generation) |
| **SignalR** (Microsoft.AspNetCore.SignalR) | Real-time messaging, presence broadcasting |
| **JWT Bearer Authentication** | Token-based auth for REST + SignalR |
| **StackExchange.Redis** | In-memory presence tracking (online status, last seen) |
| **Newtonsoft.Json** | JSON serialization (loop handling, nulls) |
| **Swagger / OpenAPI** (Microsoft.AspNetCore.OpenApi) | API docs |

All dependencies declared in `Backend/Chatly.csproj`.

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 6** | Dev server + bundler |
| **Tailwind CSS 4 + DaisyUI 5** | Utility-first styling + component library |
| **React Router DOM 7** | Client-side routing |
| **Axios** | HTTP client for REST API calls |
| **@microsoft/signalr** | SignalR client for real-time events |
| **react-hot-toast** | Toast notifications |
| **date-fns** | Relative time formatting |
| **vite-plugin-svgr** | Import SVG files as React components |

All dependencies declared in `Frontend/package.json`.

### Database
- **SQL Server 2022 Express** (via Docker) — primary data store
- **Redis** (via Docker) — ephemeral presence cache

### DevOps / Infra
- **Docker Compose** — orchestrates 4 services (`docker-compose-dev.yaml`)
- **Dockerfiles** — separate images for backend (`Backend/Dockerfile`) and frontend (`Frontend/Dockerfile`)

### Testing
No test framework is present in the repository.

---

## Architecture Overview

### Clean Layered Architecture (Backend)

```
Controllers → Repository Interfaces → Repository Implementations → EF Core DbContext
     ↓
Hubs (SignalR) → direct message push to connected clients
```

The backend follows a strict layered pattern with interface-based abstractions, registered via `Program.cs` (`Backend/Program.cs:121-127`). No formal Service layer exists between controllers and repositories — business logic lives inside repositories.

### Context/Provider Pattern (Frontend)

```
App.jsx
 ├── AuthProvider          (login, signup, token storage)
 │    └── Router
 │         ├── Login/Signup (wrapped in AppProvider)
 │         └── ProtectedRoute
 │              └── AppProvider (SignalR connection, UI state)
 │                   └── APIProvider (all REST API methods)
```

Three React contexts separate concerns: **Auth** (identity), **API** (HTTP calls), **App** (SignalR, UI state, theme, image cache).

---

## Key Backend Concepts

### 1. Custom Exception Hierarchy + Unified API Response

All controllers return data wrapped in `ApiResponse<T>` (`Backend/DTO/Response.cs`), which carries `Success`, `Data`, `Errors`, `StatusCode`, `ErrorCode`, and `Details`. The same structure is mirrored on the exception side via a custom hierarchy rooted at `ApplicationException` (`Backend/Exceptions/ApplicationException.cs`):

| Exception | HTTP Equivalent |
|---|---|
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| `ApplicationArgumentException` | 400 |
| `ApplicationUnauthorizedAccessException` | 401 |
| `InternalServerException` | 500 |

Exceptions carry a fluent builder (`AddError`, `SetStatusCode`, `SetErrorCode`, `SetErrorDetails`) enabling precise error reporting per field. Controllers catch each type and map it to the appropriate HTTP status code, always returning `ApiResponse<object>.ErrorResponse(...)`. Example at `Backend/Controllers/ContactsContorller.cs:35-88`.

### 2. Contact Status State Machine

The `ContactStatus` enum (`Backend/Models/Contact.cs:6-13`) drives a multi-step contact lifecycle:

```
None → Pending (request sent) → Accepted (request accepted)
     → Blocked (either party blocks)
Blocked → None (only the blocker can unblock)
```

Transition logic is enforced in `ContactRepository.UpdateContactStatus()` (`Backend/Repositories/ContactRepository.cs:169-220`), which checks which actor is performing the action and which state transitions are valid. The `ActorId` field tracks who last changed the status.

### 3. Redis Presence Tracking

Online status is stored entirely in Redis, separate from relational data. `PresenceRepository` (`Backend/Repositories/PresenceRepository.cs`) uses:
- A Redis SET `online_users` — membership indicates online
- String keys `last_seen:{userId}` — ISO 8601 timestamp

The `UserHub` SignalR hub (`Backend/Hubs/UserHub.cs`) calls `AddUserOnlineAsync` on connect and `RemoveUserOnlineAsync` on disconnect. The `ContactHub` (`Backend/Hubs/ContactHub.cs`) broadcasts "ActiveUser" events to all contacts on connect.

### 4. SignalR Hub Layout + JWT Token Passthrough

Three hubs are registered in `Program.cs:217-219`:

| Hub | Route | Purpose |
|---|---|---|
| `UserHub` | `/hubs/users` | Presence tracking (connect/disconnect) |
| `ContactHub` | `/hubs/contacts` | Broadcast online status to contacts |
| `MessageHub` | `/hubs/messages` | Real-time message delivery (empty — all pushing done via `IHubContext` from controllers) |

Hubs are `[Authorize]`. JWT is passed via query string (`access_token`) for WebSocket connections, extracted in `JwtBearerEvents.OnMessageReceived` (`Program.cs:62-80`). This is the standard SignalR pattern because WebSocket doesn't support custom headers during upgrade.

### 5. Forward & Reply Message Model

Messages can be either normal, a reply to another message, or a forwarded message. This is modeled via two ancillary entities:

- `ReplyMessage` (`Backend/Models/ReplyMessage.cs`) — links to the original message's content and sender
- `ForwardMessage` (`Backend/Models/ForwardMessage.cs`) — carries `PreviousContactId`, `PreviousSenderId`, and optional `SubContent` (comment added during forwarding)

Both are 1:1 with `Message`, enforced via EF Core configuration (`ApplicationDbContext.cs:52-62`). The `MessageRepository.CreateAsync()` method (`Backend/Repositories/MessageRepository.cs:21-146`) contains extensive validation: can't forward to the same contact, can't reply with a contact mismatch, can't forward without authorization on the source contact.

### 6. Send-to-Many (Broadcast Messaging)

`CreateManyAsync` (`Backend/Repositories/MessageRepository.cs:148-288`) accepts a list of contact IDs and creates a message for each, optionally resolving a single forwarded/replied message across all targets. Used by the frontend for multi-select forwarding. The SignalR broadcast loop separates sender from receiver for each contact pair.

### 7. Extension Method Mappers

Entity-to-DTO mapping is done via static extension methods rather than AutoMapper:

| File | Purpose |
|---|---|
| `Backend/Extensions/MessageToMessageResponseExtension.cs` | `Message` → `MessageResponseDto` (including nested forward/reply DTOs) |
| `Backend/Mappers/ContactsMapper.cs` | `Contact` → `ContactDto` |
| `Backend/Mappers/UsersMapper.cs` | `User` → `UserDto` |
| `Backend/Extensions/ClaimsPrincipalExtensions.cs` | `ClaimsPrincipal` → user ID/name |
| `Backend/Extensions/ControllerBaseExtensions.cs` | `ControllerBase.InternalServerError()` shorthand |

### 8. Startup Readiness + Retry Logic

`Program.cs:167-207` implements a retry loop on startup that waits for SQL Server to become available (up to 10 attempts, 5s delay). This is essential for the Docker Compose environment where SQL Server starts more slowly than the .NET app. EF Core also has `EnableRetryOnFailure` with 5 retries.

---

## Key Frontend Concepts

### 1. Three-Context State Architecture

| Context | Provider | State |
|---|---|---|
| **AuthContext** (`Frontend/src/Context/AuthContext.jsx`) | `AuthProvider.jsx` | Token, login/signup/logout, localStorage persistence |
| **APIContext** (`Frontend/src/Context/APIContext.jsx`) | `APIProvider.jsx` | All REST API methods (search, contacts, messages, settings) |
| **AppContext** (`Frontend/src/Context/AppContext.jsx`) | `AppProvider.jsx` | SignalR connection, reply/forward mode, theme, image cache, latest message |

`AuthProvider` wraps the entire app. `AppProvider` wraps per-route and manages SignalR lifecycle. `APIProvider` wraps the Home route.

### 2. Custom Error Classes

Six custom error classes in `Frontend/src/Exceptions/` mirror the backend's structured errors: `AuthenticationError`, `BadRequest`, `ValidationError`, `NetworkError`, `ArgumentError`, `UserNotFound`. Each provider catches Axios errors and re-throws these for specific handling in components.

### 3. SignalR Client Lifecycle

The SignalR connection (`@microsoft/signalr`) is created in `AppProvider.jsx:166-183` when a valid token is present. It connects to `/hubs/messages` with `withAutomaticReconnect()`. The `Subscribe` handler for `ReceiveMessage` updates `latestMessage`, which triggers re-renders in chat windows. The connection is torn down on unmount via the `useEffect` cleanup function.

### 4. Reply & Forward Mode

Reply and forward states are managed at the AppProvider level and consumed by `MessageInputField.jsx`. When reply mode is active, a preview of the original message is shown above the input. When forward mode is active, a full-screen overlay (`ForwardMessageUserList`) displays contacts for multi-select, then calls `sendMessageToMany`.

### 5. Image Lazy Loading + Cache

`AppProvider.jsx:100-112` implements an on-demand image loading system. Components call `requestImage(userId)` (e.g., `ProfilePicture.jsx`), which triggers a fetch to `/api/users/profilepicture/{userId}`. Results are cached in `imageCache` (a map of userId → blob URL), and a `requestedImages` Set prevents duplicate fetches. Failed requests are cached as `null` to avoid retries.

### 6. Protected Routing

`ProtectedRoute.jsx` checks token and user existence on mount via `AuthContext`. If either is missing, it shows a toast and redirects to `/login`. The entire app after login is under a single top-level route path (`*` in `App.jsx:38-46`), with sub-routing handled within `Home.jsx`.

### 7. Context Menu System

Right-click context menus on chat messages and contacts use a global toggle (`globalContextMenu` in `AppContext`) to ensure only one menu is visible at a time. A `useEffect` in `AppProvider.jsx:134-154` adds document-level click/contextmenu listeners to close any open menu.

---

## Data Model

```
User (extends IdentityUser)
 ├── Id, UserName, Email, DisplayName
 ├── Theme, LastSeen, IsOnline
 └── Contacts (collection)

Contact (PK: Id)
 ├── UserId ──→ User (requester)
 ├── ContactId ──→ User (target)
 ├── ActorId ──→ User (who last changed status)
 ├── Status (enum: None/Pending/Accepted/Blocked)
 ├── MessageId ──→ Message (latest)
 ├── UnreadCount, ChatDeleted, Mutated, Archived
 └── Messages (collection)

Message (PK: Id)
 ├── ContactId ──→ Contact
 ├── SenderId
 ├── Content, CreatedAt, Read, SeenAt
 ├── IsForwarded, IsReply
 ├── ReplyMessage (1:1)
 └── ForwardMessage (1:1)

ReplyMessage (1:1 with Message)
 ├── PreviousContent, PreviousSenderId

ForwardMessage (1:1 with Message)
 ├── SubContent, PreviousContactId, PreviousSenderId
```

---

## Key File Reference

| File | Signal |
|---|---|
| `Backend/Program.cs` | Full startup pipeline, DI, middleware, hub mapping, DB readiness |
| `Backend/Data/ApplicationDbContext.cs` | EF configuration, relationships, indexes |
| `Backend/DTO/Response.cs` | Unified API response wrapper |
| `Backend/Exceptions/ApplicationException.cs` | Fluent exception base class |
| `Backend/Repositories/ContactRepository.cs` | Contact CRUD + status state machine |
| `Backend/Repositories/MessageRepository.cs` | Message CRUD + forward/reply logic + send-to-many |
| `Backend/Repositories/PresenceRepository.cs` | Redis presence operations |
| `Backend/Services/TokenService.cs` | JWT generation |
| `Backend/Hubs/ContactHub.cs` | Presence broadcast on connect |
| `Backend/Hubs/UserHub.cs` | Online/offline lifecycle |
| `Backend/Extensions/MessageToMessageResponseExtension.cs` | Entity-to-DTO mapping |
| `Frontend/src/Providers/AuthProvider.jsx` | Auth state, localStorage token management |
| `Frontend/src/Providers/AppProvider.jsx` | SignalR connection, reply/forward, image cache, theme |
| `Frontend/src/Providers/APIProvider.jsx` | All REST API wrapper methods |
| `Frontend/src/Pages/Home/Chats/ChatsWindow.jsx` | Chat window orchestrator (contact selection, message load) |
| `Frontend/src/Pages/Home/Chats/Components/MessageInputField.jsx` | Message input with reply/forward UI |
| `Frontend/src/Pages/Home/Chats/Components/Chat.jsx` | Message bubble with context menu, reply preview, forward badge |
| `docker-compose-dev.yaml` | 4-service dev environment definition |
