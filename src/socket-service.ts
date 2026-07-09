import { WebSocketServer, WebSocket } from 'ws';
import { SocketEventName } from './types';

type MessageHandler = (client: WebSocket, data: any) => void;

/**
 * WebSocket service that opens a socket server and listens for client connections.
 * Handles incoming messages and dispatches them to registered handlers.
 */
class SocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private handlers: Map<string, MessageHandler> = new Map();

  /**
   * Start the WebSocket server on the given port.
   */
  start(port: number = 8080): void {
    this.wss = new WebSocketServer({ port });

    console.log(`[SocketService] WebSocket server started on ws://localhost:${port}`);

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`[SocketService] Client connected. Total clients: ${this.clients.size}`);

      // Send a welcome message to the newly connected client
      ws.send(JSON.stringify({
        event: SocketEventName.serverHealth,
        data: { status: 'connected', timestamp: new Date().toISOString() }
      }));

      ws.on('message', (raw: Buffer) => {
        try {
          const message = JSON.parse(raw.toString());
          const { event, data } = message;

          if (event) {
            const handler = this.handlers.get(event);
            if (handler) {
              handler(ws, data);
            } else {
              console.log(`[SocketService] No handler registered for event: "${event}"`);
            }
          }
        } catch (err) {
          console.error('[SocketService] Failed to parse message:', (err as Error).message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[SocketService] Client disconnected. Total clients: ${this.clients.size}`);
      });

      ws.on('error', (err: Error) => {
        console.error('[SocketService] Client error:', err.message);
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (err: Error) => {
      console.error('[SocketService] Server error:', err.message);
    });
  }

  /**
   * Register a handler for a specific event name.
   */
  on(eventName: string, handler: MessageHandler): void {
    this.handlers.set(eventName, handler);
    console.log(`[SocketService] Handler registered for event: "${eventName}"`);
  }

  /**
   * Broadcast a message to all connected clients.
   */
  broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    let sent = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sent++;
      }
    });
    console.log(`[SocketService] Broadcast "${event}" to ${sent} client(s)`);
  }

  /**
   * Send a message to a specific client.
   */
  sendTo(client: WebSocket, event: string, data: any): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * Get the number of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Stop the WebSocket server and disconnect all clients.
   */
  stop(): void {
    if (this.wss) {
      this.clients.forEach((client) => {
        client.close();
      });
      this.clients.clear();
      this.wss.close();
      this.wss = null;
      console.log('[SocketService] WebSocket server stopped.');
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;