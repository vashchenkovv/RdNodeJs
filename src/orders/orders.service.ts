import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { AuthUser } from 'src/auth/types/auth.type';
import { isStuffUtil } from 'src/auth/utils/is-staff.util';
import { ROLES } from 'src/auth/enums/roles.enum';
import { OrdersEventsService } from './orders-events.service';
import { OrdersProcessMessage } from './types/orders-queue.type';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { ProcessedMessage } from 'src/infrastructure/processed-message.entity';
import { randomUUID } from 'node:crypto';

export type ListOrdersInput = {
  userId?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private ordersEventsService: OrdersEventsService,
    private rabbitmqService: RabbitmqService,
  ) {}

  async creteOrder(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order | null> {
    const user = await this.userRepository.findOneBy({
      email: createOrderDto.userEmail,
    });
    if (!user) throw new NotFoundException('User not found');

    if (createOrderDto.idempotencyKey) {
      const existOrder = await this.orderRepository.findOne({
        where: { idempotencyKey: createOrderDto.idempotencyKey },
        relations: { user: true, items: { product: true } },
      });

      if (existOrder) return existOrder;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const _orderRepository = queryRunner.manager.getRepository(Order);
      const _orderItemRepository = queryRunner.manager.getRepository(OrderItem);
      const _productRepository = queryRunner.manager.getRepository(Product);

      const productIds = [
        ...new Set(createOrderDto.items.map((item) => item.productId)),
      ];

      const products = await _productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids: productIds })
        .setLock('pessimistic_write')
        .getMany();

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      for (const item of createOrderDto.items) {
        const product = productsById.get(item.productId);
        if (!product) throw new NotFoundException('Product not found');
        if (!product.isActive)
          throw new ConflictException(
            `The product ${product.title} is not available`,
          );
        if (product.stock < item.quantity)
          throw new ConflictException('Not enough goods in stock');
        product.stock -= item.quantity;
      }

      await _productRepository.save([...productsById.values()]);

      const order = _orderRepository.create({
        user: user,
        idempotencyKey: createOrderDto.idempotencyKey ?? null,
      });

      await _orderRepository.save(order);

      const orderItems = createOrderDto.items.map((item) => {
        return _orderItemRepository.create({
          order,
          product: productsById.get(item.productId),
          quantity: item.quantity,
          priceSnapshot: item.price.toFixed(2),
        });
      });

      await _orderItemRepository.save(orderItems);

      await queryRunner.commitTransaction();

      const createdOrder: Order | null = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: { user: true, items: { product: true } },
      });

      this.logger.log('the order created');

      if (createdOrder) {
        this.logger.log('Send message to RaggitMQ');
        const message: OrdersProcessMessage = {
          messageId: randomUUID(),
          orderId: createdOrder.id,
          createdAt: new Date().toDateString(),
          attempt: 1,
          producer: userId ?? null,
          eventName: 'Orders Process',
        };
        this.rabbitmqService.publishToQueue('orders.process', message, {
          messageId: message.messageId,
        });
      }

      return createdOrder;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  orderList(inputParam: ListOrdersInput): Promise<Order[]> {
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'i')
      .leftJoinAndSelect('i.product', 'p')
      .leftJoinAndSelect('o.user', 'u')
      .orderBy('o.createdAt', 'DESC')
      .take(inputParam.limit)
      .skip(inputParam.offset);

    if (inputParam.userId) {
      qb.andWhere('o.user_id = :userId', { userId: inputParam.userId });
    }

    if (inputParam.status) {
      qb.andWhere('o.status = :status', { status: inputParam.status });
    }

    if (inputParam.from) {
      qb.andWhere('o.createdAt >= :from', {
        from: inputParam.from,
      });
    }

    if (inputParam.to) {
      qb.andWhere('o.createdAt <= :to', {
        to: inputParam.to,
      });
    }

    return qb.getMany();
  }

  async deleteById(orderId: string): Promise<boolean> {
    const result = await this.orderRepository.delete({ id: orderId });
    return (result.affected ?? 0) > 0;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    user: AuthUser,
  ): Promise<Order> {
    if (!isStuffUtil(user.roles as ROLES[])) {
      throw new ForbiddenException('Only staff can change order status');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === status) {
      return order;
    }

    order.status = status;
    order.statusVersion = (order.statusVersion ?? 0) + 1;
    const saved = await this.orderRepository.save(order);

    this.ordersEventsService.publishStatusChanged({
      orderId: saved.id,
      status: saved.status,
      version: saved.statusVersion,
      ts: Date.now(),
    });

    return saved;
  }

  async canSubscribeToOrder(orderId: string, user: AuthUser): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.canAccessOrder(order, user);
  }

  private canAccessOrder(order: Order, user: AuthUser): void {
    if (isStuffUtil(user.roles as ROLES[])) {
      return;
    }

    if (order.userId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }
  }

  async processFromQueue(message: OrdersProcessMessage): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      this.logger.log('Start process transaction');
      const pmRepository = manager.getRepository(ProcessedMessage);

      try {
        const pm = pmRepository.create({
          messageId: message.messageId,
          orderId: message.orderId,
          eventName: message.eventName,
          processedAt: new Date().toISOString(),
        });
        await pmRepository.insert(pm);
      } catch (err: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.error('err', err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (String(err?.code) === '23505') {
          return;
        }
        throw err;
      }

      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id: message.orderId },
      });
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = OrderStatus.PROCESSED;
      await orderRepository.save(order);

      this.logger.log('The order updated');

      this.logger.log('Notify about new status of the order');
      this.ordersEventsService.publishStatusChanged({
        orderId: order.id,
        status: OrderStatus.PROCESSED,
        version: 1,
        ts: Date.now(),
      });
    });
  }
}
