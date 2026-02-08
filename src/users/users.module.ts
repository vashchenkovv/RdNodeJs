import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Order } from 'src/orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [UsersController],
  providers: [UsersService, TypeOrmModule],
})
export class UsersModule {}
