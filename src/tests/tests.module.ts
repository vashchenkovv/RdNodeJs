import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/order.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { ProcessedMessage } from 'src/infrastructure/processed-message.entity';
import { OrderTestsService } from './order-tests.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      User,
      Product,
      ProcessedMessage,
    ]),
    OrdersModule,
  ],
  controllers: [TestsController],
  providers: [OrderTestsService],
})
export class TestsModule {}
