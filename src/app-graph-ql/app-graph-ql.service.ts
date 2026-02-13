import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/order-item.entity';
import { Order } from 'src/orders/order.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import {
  orderEntityToOrderType,
  orderItemEntityToOrderItemType,
  userEntityToUserType,
} from './uthils/maps.util';
import { OrderType } from './types/order.type';
import { UserType } from './types/user.type';
import { OrderItemType } from './types/order-item.type';

@Injectable()
export class AppGraphQlService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getAllOreders(): Promise<OrderType[] | null> {
    const entities = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities ? entities.map(orderEntityToOrderType) : null;
  }

  async getUserByID(id: string): Promise<UserType | null> {
    const entity = await this.userRepository.findOneBy({ id });
    return entity ? userEntityToUserType(entity) : null;
  }

  async getOrderItemByOrderID(
    orderId: string,
  ): Promise<OrderItemType[] | null> {
    const entities = await this.orderItemRepository.find({
      where: { orderId },
      relations: { product: true },
    });
    return entities ? entities.map(orderItemEntityToOrderItemType) : [];
  }
}
