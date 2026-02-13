import { WS_BASE_URL } from './api/config';
import type {
  WSClientMessage,
  WSServerMessage,
  WSGatewayStatusMessage,
  WSLogMessage,
  WSPongMessage,
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
  private lastPongTime = Date.now();
  private connectionTimeout: NodeJS.Timeout | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing ping interval before reconnecting
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    try {
      this.ws = new WebSocket(WS_BASE_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.lastPongTime = Date.now();
        this.statusHandlers.forEach((handler) => handler(true));

        // Start ping interval
        this.pingInterval = setInterval(() => {
          this.send({ type: 'ping' });

          // Check for connection timeout (no pong for 60 seconds)
          const timeSinceLastPong = Date.now() - this.lastPongTime;
          if (timeSinceLastPong > 60000) {
            console.warn('WebSocket connection timeout - no pong received');
            this.ws?.close();
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSServerMessage = JSON.parse(event.data);

          // Handle pong messages for connection health
          if (message.type === 'pong') {
            this.lastPongTime = Date.now();
            return;
          }

          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason || 'unknown'})`);
        this.statusHandlers.forEach((handler) => handler(false));

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        // Attempt to reconnect (unless it was a normal closure)
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (_event) => {
        // Note: WebSocket error events don't contain detailed error info
        // The actual error details are available in the onclose handler
        console.warn('WebSocket connection error - will attempt to reconnect');
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

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
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
