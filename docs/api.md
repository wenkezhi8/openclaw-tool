# OpenClaw Manager - API Documentation

## Table of Contents

1. [REST API](#rest-api)
   - [Gateway Endpoints](#gateway-endpoints)
   - [Agents Endpoints](#agents-endpoints)
   - [Channels Endpoints](#channels-endpoints)
   - [Models Endpoints](#models-endpoints)
   - [Installation Endpoints](#installation-endpoints)
2. [WebSocket Protocol](#websocket-protocol)
3. [Error Responses](#error-responses)
4. [Rate Limiting](#rate-limiting)

---

## REST API

**Base URL**: `http://localhost:3001/api`

**Content-Type**: `application/json`

**Authentication** (optional): `Authorization: Bearer <api_key>`

---

### Gateway Endpoints

#### Get Gateway Status

```http
GET /api/gateway/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "running" | "stopped" | "error",
    "pid": 12345,
    "uptime": 3600,
    "memory": {
      "rss": 123456789,
      "heapTotal": 12345678,
      "heapUsed": 1234567,
      "external": 123456
    },
    "cpu": 5.2,
    "port": 8000,
    "lastError": null
  }
}
```

#### Start Gateway

```http
POST /api/gateway/start
```

**Request Body** (optional):
```json
{
  "port": 8000,
  "workers": 4
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "running",
    "pid": 12345,
    "message": "Gateway started successfully"
  }
}
```

#### Stop Gateway

```http
POST /api/gateway/stop
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "stopped",
    "message": "Gateway stopped successfully"
  }
}
```

#### Restart Gateway

```http
POST /api/gateway/restart
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "running",
    "pid": 12346,
    "message": "Gateway restarted successfully"
  }
}
```

#### Get Gateway Metrics

```http
GET /api/gateway/metrics
```

**Query Parameters**:
- `period`: `1h` | `24h` | `7d` (default: `1h`)

**Response**:
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 10000,
      "success": 9850,
      "error": 150
    },
    "latency": {
      "p50": 45,
      "p95": 120,
      "p99": 250
    },
    "throughput": 167.5,
    "timestamp": "2026-02-12T10:00:00Z"
  }
}
```

---

### Agents Endpoints

#### List Agents

```http
GET /api/agents
```

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: `active` | `inactive` | `all` (default: `all`)
- `search`: string (search by name)

**Response**:
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "agent-uuid-1",
        "name": "Agent Name",
        "description": "Agent description",
        "status": "active",
        "type": "chat",
        "model": "gpt-4",
        "createdAt": "2026-02-12T10:00:00Z",
        "updatedAt": "2026-02-12T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### Get Agent Details

```http
GET /api/agents/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "agent-uuid-1",
    "name": "Agent Name",
    "description": "Agent description",
    "status": "active",
    "type": "chat",
    "model": "gpt-4",
    "config": {
      "temperature": 0.7,
      "maxTokens": 2000,
      "systemPrompt": "You are a helpful assistant."
    },
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T11:00:00Z"
  }
}
```

#### Create Agent

```http
POST /api/agents
```

**Request Body**:
```json
{
  "name": "Agent Name",
  "description": "Agent description",
  "type": "chat",
  "model": "gpt-4",
  "config": {
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompt": "You are a helpful assistant."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "agent-uuid-1",
    "name": "Agent Name",
    "status": "active",
    "createdAt": "2026-02-12T10:00:00Z"
  }
}
```

#### Update Agent

```http
PUT /api/agents/:id
```

**Request Body** (partial update supported):
```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "config": {
    "temperature": 0.8
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "agent-uuid-1",
    "name": "Updated Agent Name",
    "updatedAt": "2026-02-12T12:00:00Z"
  }
}
```

#### Delete Agent

```http
DELETE /api/agents/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Agent deleted successfully"
  }
}
```

---

### Channels Endpoints

#### List Channels

```http
GET /api/channels
```

**Response**:
```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "id": "channel-uuid-1",
        "name": "OpenAI",
        "type": "openai",
        "enabled": true,
        "priority": 1,
        "config": {
          "apiKey": "sk-***",
          "baseURL": "https://api.openai.com/v1"
        },
        "createdAt": "2026-02-12T10:00:00Z"
      }
    ]
  }
}
```

#### Add Channel

```http
POST /api/channels
```

**Request Body**:
```json
{
  "name": "Channel Name",
  "type": "openai" | "anthropic" | "azure" | "custom",
  "enabled": true,
  "priority": 1,
  "config": {
    "apiKey": "sk-...",
    "baseURL": "https://api.example.com/v1"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "channel-uuid-1",
    "name": "Channel Name",
    "enabled": true
  }
}
```

#### Update Channel

```http
PUT /api/channels/:id
```

**Request Body**:
```json
{
  "enabled": false,
  "priority": 2
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "channel-uuid-1",
    "enabled": false
  }
}
```

#### Delete Channel

```http
DELETE /api/channels/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Channel deleted successfully"
  }
}
```

---

### Models Endpoints

#### List Models

```http
GET /api/models
```

**Query Parameters**:
- `channel`: string (filter by channel)

**Response**:
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4",
        "name": "GPT-4",
        "channel": "OpenAI",
        "enabled": true,
        "contextLength": 8192,
        "pricing": {
          "input": 0.03,
          "output": 0.06
        }
      }
    ]
  }
}
```

#### Add Model

```http
POST /api/models
```

**Request Body**:
```json
{
  "id": "model-id",
  "name": "Model Name",
  "channel": "channel-id",
  "enabled": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "model-id",
    "name": "Model Name"
  }
}
```

---

### Installation Endpoints

#### Get Installation Status

```http
GET /api/install/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "installed": true,
    "version": "1.2.3",
    "path": "/usr/local/bin/openclaw",
    "latestVersion": "1.2.5",
    "updateAvailable": true
  }
}
```

#### Install OpenClaw

```http
POST /api/install
```

**Request Body** (optional):
```json
{
  "version": "latest",
  "force": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Installation started",
    "taskId": "install-task-uuid"
  }
}
```

#### Uninstall OpenClaw

```http
DELETE /api/install
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Uninstallation started"
  }
}
```

#### Update OpenClaw

```http
POST /api/install/update
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Update started",
    "fromVersion": "1.2.3",
    "toVersion": "1.2.5"
  }
}
```

---

## WebSocket Protocol

**Connection URL**: `ws://localhost:3001/ws`

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  // Authenticate (optional)
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'api-key'
  }));
};
```

### Message Format

All messages follow this structure:

```typescript
{
  type: string,      // Message type
  id: string,        // Unique message ID
  data: any,         // Message payload
  timestamp: string  // ISO timestamp
}
```

### Message Types

#### Client → Server

| Type | Description | Payload |
|------|-------------|---------|
| `auth` | Authentication | `{ token: string }` |
| `subscribe` | Subscribe to events | `{ channel: string }` |
| `unsubscribe` | Unsubscribe from events | `{ channel: string }` |
| `ping` | Keep-alive ping | `{}` |

#### Server → Client

| Type | Description | Payload |
|------|-------------|---------|
| `auth_result` | Auth response | `{ success: boolean }` |
| `log` | Log entry | `{ level, message, timestamp }` |
| `gateway_status` | Gateway status change | `{ status, pid, uptime }` |
| `agent_update` | Agent update | `{ agentId, data }` |
| `metric` | Metric update | `{ name, value, timestamp }` |
| `error` | Error notification | `{ code, message }` |
| `pong` | Keep-alive response | `{}` |

### Log Streaming

Subscribe to real-time logs:

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'logs',
  data: {
    level: 'info',     // debug | info | warn | error
    component: 'gateway' // gateway | agents | all
  }
}));
```

Log message format:

```json
{
  "type": "log",
  "id": "msg-uuid",
  "data": {
    "level": "info",
    "message": "Gateway started on port 8000",
    "component": "gateway",
    "timestamp": "2026-02-12T10:00:00.000Z"
  },
  "timestamp": "2026-02-12T10:00:00.000Z"
}
```

### Gateway Status Updates

Subscribe to gateway status changes:

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'gateway_status'
}));
```

Status update format:

```json
{
  "type": "gateway_status",
  "id": "msg-uuid",
  "data": {
    "status": "running",
    "pid": 12345,
    "uptime": 3600,
    "memory": { "rss": 123456789 },
    "cpu": 5.2
  },
  "timestamp": "2026-02-12T10:00:00.000Z"
}
```

### Keep-Alive

Client sends ping every 30 seconds:

```javascript
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

Server responds with pong:

```json
{
  "type": "pong",
  "timestamp": "2026-02-12T10:00:00.000Z"
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate name) |
| `COMMAND_FAILED` | 500 | OpenClaw CLI command failed |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Examples

```json
{
  "success": false,
  "error": {
    "code": "COMMAND_FAILED",
    "message": "Failed to start gateway",
    "details": {
      "command": "openclaw gateway start",
      "exitCode": 1,
      "stderr": "Port 8000 already in use"
    }
  }
}
```

---

## Rate Limiting

### Endpoint Limits

| Endpoint Type | Rate Limit |
|---------------|------------|
| Gateway control | 10 requests/minute |
| Agent CRUD | 30 requests/minute |
| Read operations | 60 requests/minute |

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 10,
      "remaining": 0,
      "resetAt": "2026-02-12T10:01:00Z"
    }
  }
}
```

### Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1707720000
```
