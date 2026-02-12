# OpenClaw Manager - Architecture Design

## 1. Overview

OpenClaw Manager is a web-based management platform for the OpenClaw AI Gateway and Agent system. It provides a user-friendly interface to manage OpenClaw CLI operations through a web browser.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Browser                              │
│                    (Next.js 15 Frontend)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
        ▼                                               ▼
┌───────────────────┐                           ┌───────────────────┐
│   REST API        │                           │   WebSocket       │
│   (Express)       │                           │   Server (ws)     │
└─────────┬─────────┘                           └─────────┬─────────┘
          │                                                 │
          └─────────────────────┬───────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   OpenClaw Service    │
                    │   (CLI Wrapper)       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   OpenClaw CLI        │
                    │   (System Commands)   │
                    └───────────────────────┘
```

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Styling |
| shadcn/ui | latest | UI component library |
| React Query | 5.x | Data fetching and caching |
| Zustand | 5.x | State management |
| WebSocket API | native | Real-time communication |
| Axios | 1.x | HTTP client |

**Rationale:**
- **Next.js 15**: Latest stable version with App Router, Server Components, and improved performance
- **shadcn/ui**: Modern, accessible components with TailwindCSS integration
- **React Query**: Efficient server state management with caching and revalidation
- **Zustand**: Lightweight state management for client-side state

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime environment |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| ws | 8.x | WebSocket server |
| child_process | native | CLI command execution |
| uuid | 10.x | Unique identifiers |
| winston | 3.x | Logging |
| cors | 2.x | CORS handling |
| helmet | 7.x | Security headers |

**Rationale:**
- **Node.js 20 LTS**: Long-term support with latest features
- **Express**: Minimal, flexible web framework
- **ws**: Lightweight WebSocket library
- **child_process**: Native Node.js module for spawning CLI processes

## 4. System Components

### 4.1 Frontend Architecture

#### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                      App Layout                         │
├─────────────┬───────────────────────────────────────────┤
│   Sidebar   │              Main Content                 │
│  Navigation │     ┌─────────────────────────────────┐   │
│             │     │     Page Component               │   │
│  - Gateway  │     │     ┌───────────┬─────────────┐  │   │
│  - Agents   │     │     │  Header   │  Actions    │  │   │
│  - Channels │     │     ├───────────┼─────────────┤  │   │
│  - Models   │     │     │           │             │  │   │
│  - Logs     │     │     │  Content  │  Sidebar    │  │   │
│  - Settings │     │     │           │             │  │   │
│             │     │     └───────────┴─────────────┘  │   │
│             │     └─────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────┘
```

#### State Management

- **Server State**: React Query (API data, caching, revalidation)
- **Client State**: Zustand (UI state, filters, modals)
- **Form State**: React Hook Form (form validation, submission)

#### Data Flow

1. User Action → Component Event Handler
2. Event Handler → Custom Hook / API Client
3. API Client → REST/WebSocket Backend
4. Backend → OpenClaw CLI
5. Response → React Query Cache → Component Re-render

### 4.2 Backend Architecture

#### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Routes Layer                         │
│              (Express Router Definitions)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Controllers Layer                       │
│           (Request/Response Handling)                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Services Layer                         │
│              (Business Logic)                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  OpenClaw CLI Wrapper                    │
│              (Command Execution)                          │
└───────────────────────────────────────────────────────────┘
```

#### WebSocket Architecture

```
                    WebSocket Server
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  Logs     │     │  Gateway  │     │  Metrics  │
  │  Handler  │     │  Handler  │     │  Handler  │
  └───────────┘     └───────────┘     └───────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────┴─────┐
                    │  Clients  │
                    └───────────┘
```

## 5. Key Design Decisions

### 5.1 CLI Command Execution

**Approach**: Use Node.js `child_process.spawn()` for executing OpenClaw commands

**Rationale**:
- Real-time stdout/stderr streaming
- Proper process management (start, stop, kill)
- Event-driven handling of command output

**Implementation**:
```typescript
// OpenClaw CLI Wrapper
const executeCommand = (command: string, args: string[]) => {
  return spawn('openclaw', args, {
    env: { ...process.env, OPENCLAW_CONFIG: configPath }
  });
};
```

### 5.2 Real-time Logs Streaming

**Approach**: WebSocket with dedicated log channels

**Rationale**:
- Low latency bidirectional communication
- Efficient for streaming large amounts of log data
- Native browser support

**Implementation**:
```typescript
// Log Stream Handler
const streamLogs = (ws: WebSocket, options: LogOptions) => {
  const logProcess = spawn('openclaw', ['logs', '--follow']);
  logProcess.stdout.on('data', (data) => {
    ws.send(JSON.stringify({ type: 'log', data: data.toString() }));
  });
};
```

### 5.3 API Rate Limiting

**Approach**: Express rate limiting middleware

**Configuration**:
- Gateway operations: 10 req/min (state-changing)
- Read operations: 60 req/min
- WebSocket connections: 5 per IP

### 5.4 Error Handling

**Strategy**: Comprehensive error handling at all layers

1. **CLI Errors**: Parse stderr, map to HTTP status codes
2. **API Errors**: Structured error responses with error codes
3. **Frontend Errors**: Error boundaries with user-friendly messages

### 5.5 Security Considerations

- **CORS**: Configured for frontend origin only
- **Helmet**: Security headers for API responses
- **Input Validation**: Zod schemas for all API inputs
- **Command Injection**: Whitelist allowed CLI commands and arguments
- **Authentication**: Optional API key support for remote access

## 6. Deployment Architecture

### Development

```
Frontend (localhost:3000) ← → Backend (localhost:3001)
```

### Production (Docker Compose)

```
┌──────────────────────────────────────────┐
│           Nginx Reverse Proxy             │
│              (Port 80/443)                │
└────────────┬───────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌────────────┐
│ Frontend │  │  Backend   │
│  :3000   │  │   :3001    │
└──────────┘  └────────────┘
```

## 7. Scalability Considerations

1. **Horizontal Scaling**: Backend can be scaled with Redis for WebSocket session sharing
2. **Load Balancing**: Multiple frontend instances behind Nginx
3. **Database**: Optional PostgreSQL for persistent configuration and history
4. **Caching**: React Query with aggressive caching for read-heavy operations

## 8. Monitoring & Observability

- **Health Checks**: `/health` endpoint for container orchestration
- **Metrics**: Prometheus-compatible metrics endpoint
- **Logging**: Winston with file and console transports
- **Error Tracking**: Sentry integration (optional)
