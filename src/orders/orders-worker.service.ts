/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import type { Channel, ConsumeMessage } from 'amqplib';
import { OrdersProcessMessage } from './types/orders-queue.type';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersWorkerService implements OnApplicationBootstrap {
  private logger = new Logger(OrdersWorkerService.name);
  private maxAttempts = 3;

  constructor(
    private rabbitmqService: RabbitmqService,
    private ordersService: OrdersService,
  ) {}

  onApplicationBootstrap() {
    this.rabbitmqService.consume('orders.process', async (msg, ch) => {
      this.logger.log('RabbitMQ (WORKER): Worker get message from RaggitMQ');
      await this.handleMessage(msg, ch);
    });
  }

  private async handleMessage(
    msg: ConsumeMessage,
    channel: Channel,
  ): Promise<void> {
    let payload: OrdersProcessMessage;
    try {
      payload = JSON.parse(
        msg.content.toString('utf-8'),
      ) as OrdersProcessMessage;
    } catch {
      this.logger.warn('RabbitMQ (WORKER): Invalid JSON');
      this.rabbitmqService.publishToQueue('orders.dlq', {
        raw: msg.content.toString('utf-8'),
      });
      channel.ack(msg);
      return;
    }

    const attempt = Number(payload.attempt ?? 1);

    try {
      await this.ordersService.processFromQueue({ ...payload, attempt });
      channel.ack(msg);
      return;
    } catch (err) {
      this.logger.warn(
        `Orders worker failed (messageId=${payload.messageId}, orderId=${payload.orderId}, attempt=${attempt})`,
      );
    }

    if (attempt >= this.maxAttempts) {
      this.logger.log(
        `RabbitMQ (WORKER): Poison orderid: ${payload.orderId}, reached attempt limit: ${attempt}. Pass order to orders.dlq queue`,
      );

      this.rabbitmqService.publishToQueue('orders.dlq', {
        ...payload,
        attempt,
      });
      channel.ack(msg);
      return;
    }

    this.logger.log(
      `RabbitMQ (WORKER): Retry orderid: ${payload.orderId}, messageId=${payload.messageId}, attempt: ${attempt + 1}`,
    );

    this.rabbitmqService.publishToQueue('orders.process', {
      ...payload,
      attempt: attempt + 1,
    });

    channel.ack(msg);
  }
}
