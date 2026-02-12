import { WS_BASE_URL } from './api/config';
import type {
  WSClientMessage,
  WSServerMessage,
  WSGatewayStatusMessage,
  WSLogMessage,
} from '@/types/log';

export type WSMessageHandler = (message: WSServerMessage) => void;
export type WSStatusHandler = (connected: boolean) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<WSMessageHandler>> = new Map();
  private statusHandlers: Set<WSStatusHandler> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_BASE_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.statusHandlers.forEach((handler) => handler(true));

        // Start ping interval
        this.pingInterval = setInterval(() => {
          this.send({ type: 'ping' });
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSServerMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.statusHandlers.forEach((handler) => handler(false));

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WSClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(channel: string, data?: Record<string, unknown> | undefined): void {
    this.send({ type: 'subscribe', channel, data });
  }

  unsubscribe(channel: string): void {
    this.send({ type: 'unsubscribe', channel });
  }

  on(type: string, handler: WSMessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  onStatusChange(handler: WSStatusHandler): () => void {
    this.statusHandlers.add(handler);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private handleMessage(message: WSServerMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
