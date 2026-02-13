import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/order-item.entity';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { LoadersFactory } from './loadersFactory';

@Module({
  imports: [TypeOrmModule.forFeature([User, OrderItem, Product])],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
