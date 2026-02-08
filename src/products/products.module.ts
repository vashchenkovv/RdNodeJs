import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { OrderItem } from 'src/orders/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderItem])],
  controllers: [],
  providers: [TypeOrmModule],
})
export class ProductsModule {}
