import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import type { WsMessage, WsClientMessage, LogEntry } from '../types';
import type { BrowserStatusEvent, BrowserScreenshotEvent } from '../types/browser';

interface WsClientSubscribeMessage {
  channel: string;
  filter?: Record<string, unknown>;
}

interface WsClient extends WebSocket {
  id: string;
  isAlive: boolean;
  subscriptions: Set<string>;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WsClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket Server
   */
  initialize(server: import('http').Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const client = ws as WsClient;
      client.id = uuidv4();
      client.isAlive = true;
      client.subscriptions = new Set();

      this.clients.set(client.id, client);

      logger.info(`WebSocket client connected: ${client.id}`);

      // Send welcome message
      this.sendToClient(client, {
        type: 'auth_result',
        data: { success: true, clientId: client.id },
        timestamp: new Date().toISOString(),
      });

      // Handle incoming messages
      client.on('message', (data: Buffer) => {
        this.handleMessage(client, data);
      });

      // Handle pong response
      client.on('pong', () => {
        client.isAlive = true;
      });

      // Handle close
      client.on('close', () => {
        this.clients.delete(client.id);
        logger.info(`WebSocket client disconnected: ${client.id}`);
      });
    });

    // Start heartbeat
    this.startHeartbeat();

    logger.info('WebSocket server initialized on path /ws');
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(client: WsClient, data: Buffer): void {
    try {
      const message: WsClientMessage = JSON.parse(data.toString());
      logger.debug(`WebSocket message received: ${message.type}`, { clientId: client.id });

      switch (message.type) {
        case 'auth':
          // Handle authentication (optional)
          this.sendToClient(client, {
            type: 'auth_result',
            data: { success: true },
            timestamp: new Date().toISOString(),
          });
          break;

        case 'subscribe': {
          // Handle subscription - channel can be in data or at root level
          const subscribeMsg = message.data as WsClientSubscribeMessage | undefined;
          const channel = subscribeMsg?.channel || (message as unknown as { channel: string })?.channel;
          if (channel) {
            client.subscriptions.add(channel);
            logger.debug(`Client ${client.id} subscribed to ${channel}`, subscribeMsg?.filter ? { filter: subscribeMsg.filter } : undefined);
          }
          break;
        }

        case 'unsubscribe': {
          // Handle unsubscription - channel can be in data or at root level
          const unsubMsg = message.data as WsClientSubscribeMessage | undefined;
          const channel = unsubMsg?.channel || (message as unknown as { channel: string })?.channel;
          if (channel) {
            client.subscriptions.delete(channel);
            logger.debug(`Client ${client.id} unsubscribed from ${channel}`);
          }
          break;
        }

        case 'ping':
          // Respond with pong
          this.sendToClient(client, {
            type: 'pong',
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          logger.warn(`Unknown WebSocket message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message', { error, clientId: client.id });
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: WsClient, message: WsMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(message: WsMessage): void {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  /**
   * Broadcast message to clients subscribed to a channel
   */
  broadcastToChannel(channel: string, message: WsMessage): void {
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) || client.subscriptions.has('all')) {
        this.sendToClient(client, message);
      }
    });
  }

  /**
   * Send log entry to subscribed clients
   */
  sendLog(logEntry: LogEntry): void {
    this.broadcastToChannel('logs', {
      type: 'log',
      id: uuidv4(),
      data: logEntry,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send gateway status update
   */
  sendGatewayStatus(status: { status: string; pid?: number; uptime?: number }): void {
    this.broadcastToChannel('gateway_status', {
      type: 'gateway_status',
      id: uuidv4(),
      data: status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send browser status update
   */
  sendBrowserStatus(event: BrowserStatusEvent): void {
    this.broadcastToChannel('browser_status', {
      type: 'browser_status',
      id: uuidv4(),
      data: event,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send browser screenshot update
   */
  sendBrowserScreenshot(event: BrowserScreenshotEvent): void {
    this.broadcastToChannel('browser_screenshot', {
      type: 'browser_screenshot',
      id: uuidv4(),
      data: event,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (client.isAlive === false) {
          client.terminate();
          this.clients.delete(client.id);
          return;
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000); // 30 seconds

    logger.info('WebSocket heartbeat started');
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get connected clients count
   */
  getClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    this.stopHeartbeat();
  }
}

export const wsService = new WebSocketService();
