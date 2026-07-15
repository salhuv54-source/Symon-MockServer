import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import { SensorsCollection, Sensor, SocketEventName } from './types';
import { GenerateSensorsTree, toArray } from './sensor-generator';
import { GenerateSensorsStatus } from './status-generator';

// Socket.IO provides the native "Socket" type representing a connected client
type MessageHandler = (client: Socket, data: any) => void;

/**
 * Socket.IO service that integrates with an HTTP server to listen for client connections.
 * Handles incoming events and dispatches them to registered listeners.
 */
class SocketService {
  private io: SocketIOServer | null = null;
  // Socket.IO keeps track of connected sockets inside namespaces internally,
  // but keeping a Set helps track active clients easily to match your original structure.
  private clients: Set<Socket> = new Set();
  private handlers: Map<string, MessageHandler> = new Map();

  /**
   * Start the Socket.IO server.
   * Pass an existing HTTP/Express server to run on the SAME port (highly recommended),
   * or a port number to run on its own port.
   */
  start(serverOrPort: http.Server | number = 3000): void {
    if (typeof serverOrPort === 'number') {
      // Starts as a standalone Socket.IO server on its own port
      this.io = new SocketIOServer(serverOrPort, {
        cors: { origin: "*" }
      });
      console.log(`[SocketService] Socket.IO server started standalone on ws://localhost:${serverOrPort}`);
    } else {
      // Attaches to your shared Express HTTP Server (runs on the exact same port!)
      this.io = new SocketIOServer(serverOrPort, {
        cors: { origin: "*" }
      });
      console.log(`[SocketService] Socket.IO server attached to HTTP Server successfully.`);
    }

    this.io.on('connection', (socket: Socket) => {
      this.clients.add(socket);
      console.log(`[SocketService] Client connected. Total clients: ${this.clients.size}`);

      this.onClientConnection(socket);

      // Send a welcome message to the newly connected client
      socket.emit(SocketEventName.serverHealth, {
        status: 'connected',
        timestamp: new Date().toISOString()
      });

      // Bind all registered custom handlers to this new connection
      this.handlers.forEach((handler, eventName) => {
        socket.on(eventName, (data: any) => {
          try {
            handler(socket, data);
          } catch (err) {
            console.error(`[SocketService] Error inside handler for "${eventName}":`, (err as Error).message);
          }
        });
      });

      socket.on('disconnect', (reason) => {
        this.clients.delete(socket);
        console.log(`[SocketService] Client disconnected (${reason}). Total clients: ${this.clients.size}`);
      });

      socket.on('error', (err: Error) => {
        console.error('[SocketService] Client error:', err.message);
        this.clients.delete(socket);
      });
    });
  }

  /**
   * Register a handler for a specific event name.
   */
  on(eventName: string, handler: MessageHandler): void {
    this.handlers.set(eventName, handler);
    console.log(`[SocketService] Handler registered for event: "${eventName}"`);

    // If server is already running, dynamically attach it to existing active clients
    if (this.io) {
      this.clients.forEach((socket) => {
        socket.on(eventName, (data) => handler(socket, data));
      });
    }
  }

  /**
   * Broadcast a message to all connected clients.
   */
  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`[SocketService] Broadcast "${event}" to all clients`);
    } else {
      console.warn('[SocketService] Cannot broadcast. Server is not started.');
    }
  }

  /**
   * Send a message to a specific client.
   */
  sendTo(client: Socket, event: string, data: any): void {
    if (client.connected) {
      client.emit(event, data);
    }
  }

  /**
   * Get the number of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  onClientConnection(client: Socket): void {
    // Fie-Data
    client.emit(SocketEventName.treeChange, toArray(GenerateSensorsTree()));
    client.emit(SocketEventName.serviceability, GenerateSensorsStatus());
    client.emit(SocketEventName.clientVersion, { message: 'Sending here clientVersion!' });

    // Agent-Data
    client.emit(SocketEventName.systemStateChange, { message: 'Sending here systemStateChange!' });
    client.emit(SocketEventName.systemInfo, { message: 'Sending here systemInfo!' });

    // Keep-Alive
    client.emit(SocketEventName.keepAlive, { message: 'Sending here keepAlive!' });

    // Communication-Status
    client.emit(SocketEventName.communicationStatus, { message: 'Sending here communicationStatus!' });

    // Server-generated-data
    client.emit(SocketEventName.serverHealth, { message: 'Sending here serverHealth!' });
    client.emit(SocketEventName.startUpInBitSensors, { message: 'Sending here startUpInBitSensors!' });
    client.emit(SocketEventName.mapsSelectionNames, { message: 'Sending here mapsSelectionNames!' });
    client.emit(SocketEventName.systemsUnreadAlertsCount, { message: 'Sending here systemsUnreadAlertsCount!' });

    // server-config
    client.emit(SocketEventName.serverConfigToClient, { message: 'Sending here serverConfigToClient!' });
  }

  /**
   * Stop the Socket.IO server and disconnect all clients.
   */
  stop(): void {
    if (this.io) {
      this.io.close();
      this.clients.clear();
      this.io = null;
      console.log('[SocketService] Socket.IO server stopped.');
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
