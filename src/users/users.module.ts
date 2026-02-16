import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Order } from 'src/orders/order.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order]), FilesModule],
  controllers: [UsersController],
  providers: [UsersService, TypeOrmModule],
})
export class UsersModule {}
