// Log Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogComponent = 'gateway' | 'agents' | 'all';

export interface LogEntry {
  level: LogLevel;
  message: string;
  component: LogComponent;
  timestamp: string;
}

export interface LogFilter {
  level?: LogLevel;
  component?: LogComponent;
  search?: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  id: string;
  data: unknown;
  timestamp: string;
}

export interface WSAuthMessage {
  type: 'auth';
  token?: string;
}

export interface WSSubscribeMessage {
  type: 'subscribe';
  channel: string;
  data?: Record<string, unknown>;
}

export interface WSUnsubscribeMessage {
  type: 'unsubscribe';
  channel: string;
}

export interface WSPingMessage {
  type: 'ping';
}

export type WSClientMessage =
  | WSAuthMessage
  | WSSubscribeMessage
  | WSUnsubscribeMessage
  | WSPingMessage;

export interface WSLogMessage extends WSMessage {
  type: 'log';
  data: LogEntry;
}

export interface WSGatewayStatusMessage extends WSMessage {
  type: 'gateway_status';
  data: {
    status: string;
    pid?: number;
    uptime?: number;
    memory?: Record<string, number>;
    cpu?: number;
  };
}

export interface WSErrorMessage extends WSMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}

export type WSServerMessage =
  | WSLogMessage
  | WSGatewayStatusMessage
  | WSErrorMessage;

export type WSStatusHandler = (connected: boolean) => void;
