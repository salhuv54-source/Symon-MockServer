import { RabbitMQClient, RabbitMQConfig } from './src/rabbitmq';

class MockSymonServer {
    private rabbitMQ: RabbitMQClient;

    constructor() {
        this.rabbitMQ = new RabbitMQClient({
            host: process.env.RABBITMQ_HOST || 'localhost',
            port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
            user: process.env.RABBITMQ_USER || 'guest',
            password: process.env.RABBITMQ_PASSWORD || 'guest',
            vhost: process.env.RABBITMQ_VHOST || '/',
            reconnectDelay: 5000,
            maxReconnectAttempts: 10,
        } as RabbitMQConfig);

        this.rabbitMQ.setCallbacks(
            () => this.onRabbitMQReady(),
            (err) => this.onRabbitMQClosed(err)
        );

        this.init();
    }

    private async onRabbitMQReady(): Promise<void> {
        console.log('[MockSymonServer] RabbitMQ is ready');

        try {
            // Assert queues/exchanges that this server needs
            await this.rabbitMQ.assertQueue('symon.events');
            await this.rabbitMQ.assertExchange('symon', 'topic');

            // Bind queue to exchange
            await this.rabbitMQ.bindQueue('symon.events', 'symon', 'event.*');

            // Start consuming messages
            await this.rabbitMQ.consume('symon.events', (msg) => {
                if (msg) {
                    this.handleMessage(msg);
                }
            });

            console.log('[MockSymonServer] Queues and exchanges configured, consumer started');
        } catch (error) {
            console.error('[MockSymonServer] Failed to configure RabbitMQ:', error);
        }
    }

    private onRabbitMQClosed(err?: Error): void {
        if (err) {
            console.error('[MockSymonServer] RabbitMQ connection closed due to error:', err.message);
        } else {
            console.log('[MockSymonServer] RabbitMQ connection closed');
        }
    }

    private handleMessage(msg: import('amqplib').ConsumeMessage): void {
        const content = msg.content.toString();
        const routingKey = msg.fields.routingKey;

        console.log(`[MockSymonServer] Received message on ${routingKey}: ${content}`);

        try {
            const data = JSON.parse(content);
            console.log('[MockSymonServer] Parsed message data:', data);

            // Acknowledge the message
            this.rabbitMQ.ack(msg);
        } catch (error) {
            console.error('[MockSymonServer] Error processing message:', error);
            // Reject the message without requeue
            this.rabbitMQ.nack(msg, false, false);
        }
    }

    async init(): Promise<void> {
        console.log('[MockSymonServer] Initializing...');

        try {
            await this.rabbitMQ.connect();
            console.log('[MockSymonServer] RabbitMQ connection initiated');
        } catch (error) {
            console.error('[MockSymonServer] Failed to connect to RabbitMQ:', error);
        }
    }

    async shutdown(): Promise<void> {
        console.log('[MockSymonServer] Shutting down...');
        await this.rabbitMQ.close();
        process.exit(0);
    }
}

// Create server instance
const server = new MockSymonServer();

// Graceful shutdown on SIGINT and SIGTERM
process.on('SIGINT', () => server.shutdown());
process.on('SIGTERM', () => server.shutdown());