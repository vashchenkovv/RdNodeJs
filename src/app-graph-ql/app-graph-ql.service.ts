import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/order-item.entity';
import { Order } from 'src/orders/order.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import {
  orderEntityToOrderType,
  orderItemEntityToOrderItemType,
  productEntytyToProductType,
  userEntityToUserType,
} from './uthils/maps.util';
import { OrderType } from './types/order.type';
import { UserType } from './types/user.type';
import { OrderItemType } from './types/order-item.type';
import { ProductType } from './types/product.type';
import { Product } from 'src/products/product.entity';
import { OrderArgsType } from './types/order-args.type';
import { AuthUser } from 'src/auth/types/auth.type';
import { ROLES } from 'src/auth/enums/roles.enum';
import { isStuffUtil } from 'src/auth/utils/is-staff.util';

@Injectable()
export class AppGraphQlService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getAllOreders(
    orderArgsType: OrderArgsType,
  ): Promise<OrderType[] | null> {
    const limit = Math.max(1, Math.min(orderArgsType.limit ?? 20, 100));
    const offset = Math.max(0, orderArgsType.offset ?? 0);

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .orderBy('o.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (orderArgsType.status) {
      qb.andWhere('o.status = :status', { status: orderArgsType.status });
    }

    if (orderArgsType.dateFrom) {
      const date: Date = new Date(orderArgsType.dateFrom);
      if (date instanceof Date && !isNaN(date.getTime())) {
        qb.andWhere('o.createdAt >= :from', { from: date.toISOString() });
      }
    }

    if (orderArgsType.dateTo) {
      const date: Date = new Date(orderArgsType.dateTo);
      if (date instanceof Date && !isNaN(date.getTime())) {
        qb.andWhere('o.createdAt <= :to', { to: orderArgsType.dateTo });
      }
    }

    const entities = await qb.getMany();
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
    });
    return entities ? entities.map(orderItemEntityToOrderItemType) : [];
  }

  async getProductByID(productId: string): Promise<ProductType | null> {
    const entity = await this.productRepository.findOneBy({ id: productId });
    return entity ? productEntytyToProductType(entity) : null;
  }

  async getOrderByID(
    orderId: string,
    user?: AuthUser,
  ): Promise<OrderType | null> {
    if (!user) throw new UnauthorizedException('Unkown user');

    const isStaff = isStuffUtil((user.roles ?? []) as ROLES[]);
    if (isStaff) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      return order ? orderEntityToOrderType(order) : null;
    }

    const ownOrder = await this.orderRepository.findOne({
      where: { id: orderId, userId: user?.sub },
    });

    return ownOrder ? orderEntityToOrderType(ownOrder) : null;
  }
}
