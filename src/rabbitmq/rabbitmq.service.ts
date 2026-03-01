/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import type { Channel, ChannelModel, Options, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private logger = new Logger(RabbitmqService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const prefetch = Number(
      this.configService.get<string>('RABBITMQ_PREFETCH') ?? 10,
    );

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.prefetch(prefetch);

    await this.channel.assertQueue('orders.process', { durable: true });
    await this.channel.assertQueue('orders.dlq', { durable: true });

    this.logger.log(`RabbitMQ connected (prefetch=${prefetch})`);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
    } finally {
      await this.connection?.close();
    }
  }

  publishToQueue(queue: string, payload: unknown, options?: Options.Publish) {
    const body = Buffer.from(JSON.stringify(payload));
    return this.channel.sendToQueue(queue, body, {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });
  }

  consume(
    queue: string,
    handler: (msg: ConsumeMessage, channel: Channel) => Promise<void>,
    options?: Options.Consume,
  ): void {
    const cb = async (msg) => {
      if (!msg) return;
      try {
        await handler(msg, this.channel);
      } catch (err) {
        this.logger.error(`Consumer error (${queue})`, err?.stack);
        this.channel.nack(msg, false, true);
      }
    };
    this.channel.consume(queue, cb, options);
  }
}
