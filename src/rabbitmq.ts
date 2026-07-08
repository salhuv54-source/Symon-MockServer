import * as amqp from 'amqplib';
import { ChannelModel, Channel, ConsumeMessage, Message } from 'amqplib';

export interface RabbitMQConfig {
  url?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  vhost?: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export class RabbitMQClient {
  private channelModel: ChannelModel | null = null;
  private channel: Channel | null = null;
  private config: Required<Pick<RabbitMQConfig, 'url' | 'reconnectDelay' | 'maxReconnectAttempts'>> &
    RabbitMQConfig;
  private reconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private onConnectionReady?: () => void;
  private onConnectionClosed?: (err?: Error) => void;

  constructor(config: RabbitMQConfig = {}) {
    const url = config.url || this.buildUrlFromParts(config);
    this.config = {
      url,
      reconnectDelay: config.reconnectDelay || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || Infinity,
    };
  }

  private buildUrlFromParts(config: RabbitMQConfig): string {
    const host = config.host || 'localhost';
    const port = config.port || 5672;
    const user = config.user || 'guest';
    const password = config.password || 'guest';
    const vhost = config.vhost || '/';
    const encodedVhost = vhost === '/' ? '%2F' : encodeURIComponent(vhost);
    return `amqp://${user}:${password}@${host}:${port}/${encodedVhost}`;
  }

  setCallbacks(onReady?: () => void, onClosed?: (err?: Error) => void): void {
    this.onConnectionReady = onReady;
    this.onConnectionClosed = onClosed;
  }

  async connect(): Promise<void> {
    if (this.isConnecting) return;
    if (this.channelModel) return;

    this.isConnecting = true;

    try {
      this.channelModel = await amqp.connect(this.config.url);

      this.channelModel.on('error', (err: Error) => {
        console.error('[RabbitMQ] Connection error:', err.message);
        this.handleConnectionClose(err);
      });

      this.channelModel.on('close', () => {
        console.error('[RabbitMQ] Connection closed');
        this.handleConnectionClose();
      });

      this.channel = await this.channelModel.createChannel();

      this.channel.on('error', (err: Error) => {
        console.error('[RabbitMQ] Channel error:', err.message);
      });

      this.channel.on('close', () => {
        console.warn('[RabbitMQ] Channel closed');
        this.channel = null;
      });

      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log(`[RabbitMQ] Connected successfully to ${this.config.url.replace(/\/\/.*@/, '//***:***@')}`);

      if (this.onConnectionReady) {
        this.onConnectionReady();
      }
    } catch (error) {
      this.isConnecting = false;
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[RabbitMQ] Connection failed: ${err.message}`);
      this.scheduleReconnect(err);
    }
  }

  private handleConnectionClose(err?: Error): void {
    this.channelModel = null;
    this.channel = null;
    if (this.onConnectionClosed) {
      this.onConnectionClosed(err);
    }
    this.scheduleReconnect(err);
  }

  private scheduleReconnect(err?: Error): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(`[RabbitMQ] Max reconnect attempts (${this.config.maxReconnectAttempts}) reached. Giving up.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay;
    console.log(
      `[RabbitMQ] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts === Infinity ? '∞' : this.config.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      throw new Error('[RabbitMQ] No active channel. Call connect() first.');
    }
    return this.channel;
  }

  async assertQueue(queue: string, options?: amqp.Options.AssertQueue): Promise<amqp.Replies.AssertQueue> {
    const ch = await this.getChannel();
    return ch.assertQueue(queue, { durable: true, ...options });
  }

  async assertExchange(
    exchange: string,
    type: string,
    options?: amqp.Options.AssertExchange
  ): Promise<amqp.Replies.AssertExchange> {
    const ch = await this.getChannel();
    return ch.assertExchange(exchange, type, { durable: true, ...options });
  }

  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<amqp.Replies.Empty> {
    const ch = await this.getChannel();
    return ch.bindQueue(queue, exchange, routingKey);
  }

  async publish(
    exchange: string,
    routingKey: string,
    content: Buffer | object,
    options?: amqp.Options.Publish
  ): Promise<boolean> {
    const ch = await this.getChannel();
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(JSON.stringify(content));
    return ch.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
      ...options,
    });
  }

  async consume(
    queue: string,
    onMessage: (msg: ConsumeMessage | null) => void,
    options?: amqp.Options.Consume
  ): Promise<amqp.Replies.Consume> {
    const ch = await this.getChannel();
    return ch.consume(queue, onMessage, { noAck: false, ...options });
  }

  ack(msg: Message): void {
    if (!this.channel) {
      throw new Error('[RabbitMQ] No active channel. Call connect() first.');
    }
    this.channel.ack(msg);
  }

  nack(msg: Message, allUpTo?: boolean, requeue?: boolean): void {
    if (!this.channel) {
      throw new Error('[RabbitMQ] No active channel. Call connect() first.');
    }
    this.channel.nack(msg, allUpTo, requeue);
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.channelModel) {
        await this.channelModel.close();
        this.channelModel = null;
      }
      console.log('[RabbitMQ] Connection closed gracefully');
    } catch (error) {
      console.error('[RabbitMQ] Error during close:', error);
    }
  }

  isConnected(): boolean {
    return this.channelModel !== null && this.channel !== null;
  }
}