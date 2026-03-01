import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersEventsService } from './orders-events.service';
import { OrdersWorkerService } from './orders-worker.service';
import { ProcessedMessage } from 'src/infrastructure/processed-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      User,
      Product,
      ProcessedMessage,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEventsService, OrdersWorkerService],
  exports: [OrdersService, OrdersEventsService],
})
export class OrdersModule {}
