import express from 'express';
import http from 'http';
import appStore from './src/app-store';
import uploadService from './src/upload-service';
import socketService from './src/socket-service';
import { createRouteService } from './src/route-service';
import { DataType } from './src/types';
import { SocketEventName } from './src/interfaces/socket-events.interface';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { DataStatusBuild, DataStatusType, ServerDataStatusToClient, ServerDataStatusToClientCollection } from './src/interfaces/DataStatusBuild.interface';
import { getEventsAndFaultsForSystem } from './src/system-log.service';
import { GenerateMapsSelectionCollection } from './src/maps-selection-generator';
import cors from 'cors';
import path from 'path';

class MockSymonServer {
    private app: express.Application;
    private httpServer: http.Server;
    private Port = process.env.PORT ? parseInt(process.env.PORT, 10) : 9001;
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.init();
    }

    async init(): Promise<void> {
        console.log('[MockSymonServer] Initializing...');

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

        // Start the HTTP server (serves both REST API and Socket.IO)
        this.httpServer.listen(this.Port, () => {
            console.log(`[MockSymonServer] HTTP server listening on http://localhost:${this.Port}`);
            console.log(`[MockSymonServer] Swagger docs available at http://localhost:${this.Port}/swagger`);

            // Start all injectors 10 seconds after initialization completes
            socketService.startInjectorsWithDelay(10000);
        });

        const options: cors.CorsOptions = {
            allowedHeaders: [
                "Origin",
                "Access-Control-Allow-Headers",
                "X-Requested-With",
                "Content-Type",
                "Accept",
                "X-Access-With",
                "Authorization"
            ],
            credentials: true,
            methods: "GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE",
            origin: (origin, callback) => {
                callback(null, origin);
            }
        }
        this.app.use(cors(options));

        // Parse JSON bodies
        this.app.use(express.json());

        this.app.use("/images", express.static(path.join(__dirname, "assets")));

        // Initialize Socket.IO
        this.initSocket();

        // Mount all REST API routes from MainRoutes enum
        const apiRouter = createRouteService();
        this.app.use(apiRouter);

        // Initialize Swagger API documentation
        this.initSwagger(apiRouter);

        console.log('[MockSymonServer] Initialization complete.');
    }

    /**
     * Initialize and configure Swagger UI and OpenAPI documentation dynamically.
     */
    private initSwagger(apiRouter: express.Router): void {
        // Swagger definition
        const swaggerOptions: swaggerJsdoc.Options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'My Symon-Mock-Server API',
                    version: '1.0.0',
                    description: 'A simple Symon Mock Server API documented with Swagger',
                },
                servers: [
                    {
                        url: `http://localhost:${this.Port}`,
                        description: 'Symon server',
                    },
                ],
            },
            apis: ['./src/routes/*.ts', './index.ts'],
        };

        const swaggerDocs = swaggerJsdoc(swaggerOptions) as any;

        // Auto-scan all registered routes from the API router to build paths dynamically!
        if (!swaggerDocs.paths) {
            swaggerDocs.paths = {};
        }

        apiRouter.stack.forEach((handler: any) => {
            if (handler.route) {
                const path = handler.route.path;
                const methods = Object.keys(handler.route.methods);
                methods.forEach((method) => {
                    // Convert Express parameter style (e.g., :serviceName) to Swagger style ({serviceName})
                    const swaggerPath = path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
                    if (!swaggerDocs.paths[swaggerPath]) {
                        swaggerDocs.paths[swaggerPath] = {};
                    }

                    const parameters: any[] = [];
                    const paramMatches = path.match(/:[a-zA-Z0-9_]+/g);
                    if (paramMatches) {
                        paramMatches.forEach((m: string) => {
                            parameters.push({
                                name: m.substring(1),
                                in: 'path',
                                required: true,
                                schema: { type: 'string' }
                            });
                        });
                    }

                    // Group routes by prefix tag
                    const segments = path.split('/');
                    const tag = segments[2] || segments[1] || 'default';

                    // Prepare an optional json body template for POST/PUT requests
                    let requestBody: any = undefined;
                    if (method === 'post' || method === 'put') {
                        requestBody = {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        additionalProperties: true
                                    }
                                }
                            }
                        };
                    }

                    swaggerDocs.paths[swaggerPath][method] = {
                        summary: `${method.toUpperCase()} ${path}`,
                        tags: [tag.charAt(0).toUpperCase() + tag.slice(1)],
                        parameters: parameters.length > 0 ? parameters : undefined,
                        requestBody,
                        responses: {
                            200: {
                                description: 'Successful response'
                            }
                        }
                    };
                });
            }
        });

        // Serve Swagger UI
        this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }

    /**
     * Start the Socket.IO server and register all event message handlers.
     */
    private initSocket(): void {
        // Start the Socket.IO server
        socketService.start(this.httpServer);

        // Register explicit handlers for each SocketEventName
        socketService.on(SocketEventName.eventsChange, (client, data) => {
            console.log(`[MockSymonServer] Received eventschange:`, JSON.stringify(data));
        });
        socketService.on(SocketEventName.faultsChange, (client, data) => {
            console.log(`[MockSymonServer] Received faultChange:`, JSON.stringify(data));
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
            socketService.sendTo(client, SocketEventName.mapsSelectionNames, GenerateMapsSelectionCollection());
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
        const handleSystemLogRequest = (client: any, data: any) => {
            console.log(`[MockSymonServer] Received systemLog request:`, JSON.stringify(data));
            let selectedSystemId = data;
            if (typeof data === 'object' && data !== null) {
                selectedSystemId = data?.SelectedSystemId ?? data?.selectedSystemId ?? data?.systemId ?? data?.nodeId ?? data?.id;
            }
            const { events, faults, serviceability } = getEventsAndFaultsForSystem(selectedSystemId);

            console.log(`[MockSymonServer] Emitting log data for SelectedSystemId "${selectedSystemId}": ${events.length} events, ${faults.length} faults, ${serviceability.length} serviceability records`);

            // Emit connected events to the requesting client on eventsChange
            socketService.sendTo(client, SocketEventName.eventsChange, {
                data: events,
                isOnline: false
            });

            // Emit connected faults to the requesting client on faultsChange
            socketService.sendTo(client, SocketEventName.faultsChange, {
                data: faults,
                isOnline: false
            });

            // Emit connected serviceability to the requesting client on serviceability
            socketService.sendTo(client, SocketEventName.serviceability, serviceability);

            // Also emit response on systemLogTimeFilterChange
            socketService.sendTo(client, SocketEventName.systemLogTimeFilterChange, {
                SelectedSystemId: selectedSystemId,
                events,
                faults,
                serviceability,
                isOnline: false
            });

            // Also emit response on systemLog
            socketService.sendTo(client, 'systemLog', {
                SelectedSystemId: selectedSystemId,
                events,
                faults,
                serviceability,
                isOnline: false
            });
        };

        socketService.on(SocketEventName.systemLogTimeFilterChange, handleSystemLogRequest);
        socketService.on('systemLog', handleSystemLogRequest);
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

export function BuildDataToSendToClient(): ServerDataStatusToClientCollection {
    const newArr: ServerDataStatusToClientCollection = {};
    const allDataTypes = [
        {
            dataType: "SERVER_CONNECTION",
            getStatus: () => DataStatusType.CONNECTED_TO_SERVER,
            order: 0
        },
        {
            dataType: "RABBIT_CONNECTION",
            getStatus: () => DataStatusType.CONNECTED_TO_RABBIT,
            order: 1
        },
        {
            dataType: "DB_CONNECTION",
            getStatus: () => DataStatusType.CONNECTED_TO_DB,
            order: 2
        },
        {
            dataType: DataType.ATTRIBUTES,
            message: 'Attributes file missing',
            order: 3,
            getStatus: () => DataStatusType.DATA_RECEIVED
        },
        {
            dataType: DataType.SENSOR_TREE,
            order: 4,
            getStatus: () => DataStatusType.DATA_RECEIVED
        },
        {
            dataType: DataType.FAULT_TYPE_LIST,
            order: 5,
            getStatus: () => DataStatusType.DATA_RECEIVED
        }
    ];

    allDataTypes.forEach((data: DataStatusBuild) => {
        const isDataReceived = true;
        const dataToCache = setServerDataHealth(
            data,
            isDataReceived
        );
        if (data.dataType)
            newArr[data.dataType] = dataToCache;
    });
    return newArr;
}
export function setServerDataHealth(
    data: DataStatusBuild,
    isDataReceived: boolean
): ServerDataStatusToClient {
    return {
        isDataReceived,
        dataType: data.dataType,
        order: data.order,
        message: data.getMessage
            ? data.getMessage(data.dataType, isDataReceived)
            : defaultGetMessage(data.message, isDataReceived),
        status: data.getStatus
            ? data.getStatus(isDataReceived)
            : defaultGetStatus(isDataReceived),
    };
}
export function defaultGetMessage(message?: string, isDataArrived?: boolean): string {
    return isDataArrived ? "" : message || "";
}
export function defaultGetStatus(isDataArrived: boolean): string {
    return isDataArrived
        ? DataStatusType.DATA_RECEIVED
        : DataStatusType.DATA_NOT_RECEIVED;
}
export function GetFaultTypeList() {
    return appStore.getModel("System1")?.faults;
}
export function GetEventTypeList() {
    return appStore.getModel("System1")?.events;
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
