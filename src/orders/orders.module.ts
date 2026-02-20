import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersEventsService } from './orders-events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEventsService],
  exports: [OrdersService, OrdersEventsService],
})
export class OrdersModule {}
