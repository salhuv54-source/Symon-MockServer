import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import { SocketEventName } from './interfaces/socket-events.interface';
import { GenerateSensorsTree, toArray } from './sensor-generator';
import { GenerateSensorsStatus } from './status-generator';
import { EventInjector } from './event-injector';
import { StatusInjector } from './status-injector';
import { FaultsInjector } from './faults-injector';
import { SystemInfoInjector } from './system-info-injector';
import { SystemStateInjector } from './system-state-injector';
import { GenerateKeepAlivePayload } from './keep-alive-generator';
import { GenerateSystemStateCollection } from './system-state-generator';
import { GenerateSystemInfoList } from './system-info-generator';
import { GenerateMapsSelectionCollection } from './maps-selection-generator';
import { BuildDataToSendToClient } from '..';

import treeService from './tree.service';

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
  private eventInjector = new EventInjector(
    (event, data) => this.broadcast(event, data),
    () => this.getClientCount() > 0
  );
  private statusInjector = new StatusInjector(
    (event, data) => this.broadcast(event, data),
    () => this.getClientCount() > 0
  );
  private faultsInjector = new FaultsInjector(
    (event, data) => this.broadcast(event, data),
    () => this.getClientCount() > 0
  );
  private systemInfoInjector = new SystemInfoInjector(
    (event, data) => this.broadcast(event, data),
    () => this.getClientCount() > 0
  );
  private systemStateInjector = new SystemStateInjector(
    (event, data) => this.broadcast(event, data),
    () => this.getClientCount() > 0
  );
  private injectorStartTimeout: NodeJS.Timeout | null = null;

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
   * Starts all recurring data injectors (events, status, faults, systemInfo, systemState).
   */
  startInjectors(): void {
    console.log('[SocketService] Starting all injectors...');
    this.eventInjector.start();
    this.statusInjector.start();
    this.faultsInjector.start();
    this.systemInfoInjector.start();
    this.systemStateInjector.start();
  }

  /**
   * Starts all recurring data injectors after a specified delay in milliseconds.
   */
  startInjectorsWithDelay(delayMs: number = 10000): void {
    if (this.injectorStartTimeout) {
      clearTimeout(this.injectorStartTimeout);
    }
    console.log(`[SocketService] Scheduling injectors to start in ${delayMs / 1000} seconds...`);
    this.injectorStartTimeout = setTimeout(() => {
      this.startInjectors();
      this.injectorStartTimeout = null;
    }, delayMs);
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
    const sensorsTreeArray = treeService.buildTree();
    client.emit(SocketEventName.treeChange, sensorsTreeArray);

    const nodeIds = sensorsTreeArray.map((sensor) => sensor.id);
    client.emit(SocketEventName.serviceability, GenerateSensorsStatus(nodeIds));
    client.emit(SocketEventName.clientVersion, { message: 'Sending here clientVersion!' });

    // Agent-Data
    const systemStateCollection = GenerateSystemStateCollection(sensorsTreeArray);
    client.emit(SocketEventName.systemStateChange, systemStateCollection);
    client.emit(SocketEventName.systemInfo, GenerateSystemInfoList());

    // Keep-Alive
    const keepAlivePayload = GenerateKeepAlivePayload();
    client.emit(SocketEventName.keepAlive, keepAlivePayload);

    // Communication-Status
    client.emit(SocketEventName.communicationStatus, { message: 'Sending here communicationStatus!' });

    // Server-generated-data
    client.emit(SocketEventName.serverHealth, BuildDataToSendToClient());
    client.emit(SocketEventName.startUpInBitSensors, { message: 'Sending here startUpInBitSensors!' });
    client.emit(SocketEventName.mapsSelectionNames, GenerateMapsSelectionCollection());
    client.emit(SocketEventName.systemsUnreadAlertsCount, { message: 'Sending here systemsUnreadAlertsCount!' });

    // server-config
    client.emit(SocketEventName.serverConfigToClient, { message: 'Sending here serverConfigToClient!' });
  }

  /**
   * Stop the Socket.IO server and disconnect all clients.
   */
  stop(): void {
    if (this.injectorStartTimeout) {
      clearTimeout(this.injectorStartTimeout);
      this.injectorStartTimeout = null;
    }
    this.eventInjector.stop();
    this.statusInjector.stop();
    this.faultsInjector.stop();
    this.systemInfoInjector.stop();
    this.systemStateInjector.stop();
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
