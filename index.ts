import express from 'express';
import http from 'http';
import appStore from './src/app-store';
import uploadService from './src/upload-service';
import socketService from './src/socket-service';
import { createRouteService } from './src/route-service';
import { SocketEventName } from './src/types';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

class MockSymonServer {
    private app: express.Application;
    private httpServer: http.Server;
    private Port = 3016;
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.init();
    }

    async init(): Promise<void> {
        console.log('[MockSymonServer] Initializing...');

        // Parse JSON bodies
        this.app.use(express.json());

        
        // Start the WebSocket server
        socketService.start(this.httpServer);

        // // Swagger definition
        // const swaggerOptions: swaggerJsdoc.Options = {
        // definition: {
        //     openapi: '3.0.0',
        //     info: {
        //     title: 'My Symon-Mock-Server API',
        //     version: '1.0.0',
        //     description: 'A simple Symon Mock Server API documented with Swagger',
        //     },
        //     servers: [
        //     {
        //         url: `http://localhost:${this.Port}`,
        //         description: 'Symon server',
        //     },
        //     ],
        // },
        // // Path to the API docs (where you write your route annotations)
        // apis: ['./src/routes/*.ts', './src/index.ts'], 
        // };

        // const swaggerDocs = swaggerJsdoc(swaggerOptions);
        // // Serve Swagger UI
        // this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
        // this.app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
        
        this.app.listen(this.Port, () => {
            console.log(`Server running on http://localhost:${this.Port}`);
            console.log(`Swagger docs available at http://localhost:${this.Port}/api-docs`);
        });

        // Mount all REST API routes from MainRoutes enum
        this.app.use(createRouteService());

        // List available models in assets/model/
        const availableModels = uploadService.listAvailableModels();
        console.log(`[MockSymonServer] Available models: ${availableModels.join(', ') || '(none)'}`);

        // Automatically load the first available model on startup
        if (availableModels.length > 0) {
            const modelName = availableModels[0];
            try {
                const storedName = await uploadService.uploadModel(modelName);
                const modelData = appStore.getModel(storedName);
                if (modelData) {
                    console.log(`[MockSymonServer] Model loaded. System: ${modelData.system.name}`);
                    console.log(`[MockSymonServer]   Node types: ${modelData.nodeTypes.length}`);
                    console.log(`[MockSymonServer]   Events: ${modelData.events.length}`);
                    console.log(`[MockSymonServer]   Faults: ${modelData.faults.length}`);
                    console.log(`[MockSymonServer]   Instances: ${modelData.instances.length}`);
                }
            } catch (err) {
                console.error(`[MockSymonServer] Failed to load model "${modelName}":`, (err as Error).message);
            }
        } else {
            console.log('[MockSymonServer] No model files found in assets/model/. Place .fsx files there to load them.');
        }

        // Register explicit handlers for each SocketEventName
        // Each event has its own handler so different logic can be implemented per event
        socketService.on(SocketEventName.eventsChange, (client, data) => {
            console.log(`[MockSymonServer] Received eventsChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.faultsChange, (client, data) => {
            console.log(`[MockSymonServer] Received faultsChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.alertsChange, (client, data) => {
            console.log(`[MockSymonServer] Received alertsChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.toDeleteAlerts, (client, data) => {
            console.log(`[MockSymonServer] Received toDeleteAlerts:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.systemsUnreadAlertsCount, (client, data) => {
            console.log(`[MockSymonServer] Received systemsUnreadAlertsCount:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.userCommandsChange, (client, data) => {
            console.log(`[MockSymonServer] Received userCommandsChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.commandResultTimeFilterChange, (client, data) => {
            console.log(`[MockSymonServer] Received commandResultTimeFilterChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.startUpInBitSensors, (client, data) => {
            console.log(`[MockSymonServer] Received startUpInBitSensors:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.graphInfoTimeFilterChange, (client, data) => {
            console.log(`[MockSymonServer] Received graphInfoTimeFilterChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.treeChange, (client, data) => {
            console.log(`[MockSymonServer] Received treeChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.serviceability, (client, data) => {
            console.log(`[MockSymonServer] Received serviceability:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.clientVersion, (client, data) => {
            console.log(`[MockSymonServer] Received clientVersion:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.serverHealth, (client, data) => {
            console.log(`[MockSymonServer] Received serverHealth:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.mapsSelectionNames, (client, data) => {
            console.log(`[MockSymonServer] Received mapsSelectionNames:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.systemStateChange, (client, data) => {
            console.log(`[MockSymonServer] Received systemStateChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.commandOptions, (client, data) => {
            console.log(`[MockSymonServer] Received commandOptions:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.sensorInBit, (client, data) => {
            console.log(`[MockSymonServer] Received sensorInBit:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.systemInfo, (client, data) => {
            console.log(`[MockSymonServer] Received systemInfo:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.keepAlive, (client, data) => {
            console.log(`[MockSymonServer] Received keepAlive:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.communicationStatus, (client, data) => {
            console.log(`[MockSymonServer] Received communicationStatus:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.graphInfo, (client, data) => {
            console.log(`[MockSymonServer] Received graphInfo:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.treeMapOfflineServiceability, (client, data) => {
            console.log(`[MockSymonServer] Received treeMapOfflineServiceability:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.bitReport, (client, data) => {
            console.log(`[MockSymonServer] Received bitReport:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.commandsResults, (client, data) => {
            console.log(`[MockSymonServer] Received commandsResults:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.systemLogTimeFilterChange, (client, data) => {
            console.log(`[MockSymonServer] Received systemLogTimeFilterChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.treeMapFilterChange, (client, data) => {
            console.log(`[MockSymonServer] Received treeMapFilterChange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.serverConfigToClient, (client, data) => {
            console.log(`[MockSymonServer] Received serverConfigToClient:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.clientsPeriodicalOnlineDataRemovelFromStore, (client, data) => {
            console.log(`[MockSymonServer] Received clientsPeriodicalOnlineDataRemovelFromStore:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.updateNodeVisibility, (client, data) => {
            console.log(`[MockSymonServer] Received updateNodeVisibility:`, JSON.stringify(data));
        });

        // Start the HTTP server (serves both REST API and WebSocket)
        this.httpServer.listen(this.Port, () => {
            console.log(`[MockSymonServer] HTTP server listening on http://localhost:${this.Port}`);
        });


        console.log('[MockSymonServer] Initialization complete.');
    }

    async shutdown(): Promise<void> {
        console.log('[MockSymonServer] Shutting down...');
        socketService.stop();
        this.httpServer.close(() => {
            console.log('[MockSymonServer] HTTP server closed.');
        });
        console.log('[MockSymonServer] Goodbye.');
        process.exit(0);
    }
}

// Create server instance
const server = new MockSymonServer();

// Graceful shutdown on SIGINT and SIGTERM
process.on('SIGINT', () => server.shutdown());
process.on('SIGTERM', () => server.shutdown());

// Also clean up on uncaught exceptions and unhandled rejections to free ports
process.on('uncaughtException', (err) => {
    console.error('[MockSymonServer] Uncaught exception:', err.message);
    server.shutdown();
});
process.on('unhandledRejection', (reason) => {
    console.error('[MockSymonServer] Unhandled rejection:', reason);
    server.shutdown();
});
process.on('exit', () => {
    socketService.stop();
});
