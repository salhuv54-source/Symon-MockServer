import { io } from 'socket.io-client';
import { SocketEventName } from './src/types';

// Target port defined in index.ts is 8081
const SERVER_URL = 'http://localhost:8081';

console.log(`[TestClient] Connecting to Socket.IO server at ${SERVER_URL}...`);
const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log(`[TestClient] Successfully connected to server! Socket ID: ${socket.id}`);
});

// Register dynamic listeners for all events listed in SocketEventName
Object.values(SocketEventName).forEach((eventName) => {
  socket.on(eventName, (data) => {
    console.log(`\n==================================================`);
    console.log(`[TestClient] Event received: "${eventName}"`);
    console.log(`[TestClient] Timestamp: ${new Date().toISOString()}`);
    console.log(`[TestClient] Payload:`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`==================================================`);
  });
});

socket.on('disconnect', (reason) => {
  console.log(`[TestClient] Disconnected from server. Reason: ${reason}`);
});

socket.on('connect_error', (error) => {
  console.error(`[TestClient] Connection error:`, error.message);
});

console.log('[TestClient] Client is listening for server events. Press Ctrl+C to exit.\n');
