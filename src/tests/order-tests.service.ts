import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { Order } from 'src/orders/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { OrdersProcessMessage } from 'src/orders/types/orders-queue.type';

@Injectable()
export class OrderTestsService extends OrdersService {
  protected logger = new Logger(OrderTestsService.name);
  private issue: string | null = null; // poison | idempotency

  testOrdersProcessIssue(
    createOrderDto: CreateOrderDto,
    userId: string | null,
    issue: string | null,
  ) {
    this.issue = issue;
    return this.creteOrder(createOrderDto, userId ?? undefined);
  }

  protected publishToQueue(
    order: Order,
    eventName: string,
    queue: string,
    userId?: string,
  ): void {
    if (order) {
      this.logger.log(
        `RabbitMQ: Create message and send it to RaggitMQ (queue: ${queue})`,
      );

      const message: OrdersProcessMessage = {
        messageId: randomUUID(),
        orderId: order.id,
        createdAt: new Date().toDateString(),
        attempt: 1,
        producer: userId ?? null,
        eventName,
        testIssue: this.issue,
      };
      this.rabbitmqService.publishToQueue(queue, message, {
        messageId: message.messageId,
      });

      if (this.issue === 'idempotency') {
        this.logger.log(
          `RabbitMQ (idempotency issue): publish the same message twice`,
        );
        this.rabbitmqService.publishToQueue(queue, message, {
          messageId: message.messageId,
        });
      }
    }
  }
}
