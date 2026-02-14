import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Product } from '../../products/product.entity';
import DataLoader from 'dataloader';
import { OrderItem } from 'src/orders/order-item.entity';
import {
  orderItemEntityToOrderItemType,
  productEntytyToProductType,
  userEntityToUserType,
} from '../uthils/maps.util';
import { UserType } from '../types/user.type';
import { OrderItemType } from '../types/order-item.type';
import { ProductType } from '../types/product.type';
import { AuthUser } from 'src/auth/types/auth.type';

export type AppLoaders = {
  userByIdLoader: DataLoader<string, UserType | null>;
  productByIdLoader: DataLoader<string, ProductType | null>;
  orderItemByIdLoader: DataLoader<string, OrderItemType[] | null>;
};

export type GraphQLContext = {
  req: Request & { user?: AuthUser };
  loaders: AppLoaders;
  strategy?: 'naive' | 'optimized';
};

@Injectable()
export class LoadersFactory {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  create(): AppLoaders {
    return {
      userByIdLoader: new DataLoader<string, UserType | null>(async (ids) => {
        if (ids.length === 0) return [];

        const users = await this.usersRepository.find({
          where: { id: In([...ids]) },
        });

        const usersById = new Map(users.map((user) => [user.id, user]));

        return ids.map((id) => {
          const entity = usersById.get(id);
          return entity ? userEntityToUserType(entity) : null;
        });
      }),
      productByIdLoader: new DataLoader<string, ProductType | null>(
        async (ids) => {
          if (ids.length === 0) return [];

          const products = await this.productsRepository.find({
            where: { id: In([...ids]) },
          });

          const productsById = new Map(
            products.map((product) => [product.id, product]),
          );

          return ids.map((id) => {
            const product = productsById.get(id);
            return product ? productEntytyToProductType(product) : null;
          });
        },
      ),
      orderItemByIdLoader: new DataLoader<string, OrderItemType[] | null>(
        async (orderIds) => {
          if (orderIds.length === 0) return [];

          const orderItems = await this.orderItemRepository.find({
            where: { orderId: In([...orderIds]) },
          });

          const orderItemsByOrderId = new Map<string, OrderItemType[]>();
          orderItems.forEach((orderItem) => {
            if (!orderItemsByOrderId.get(orderItem.orderId)) {
              orderItemsByOrderId.set(orderItem.orderId, []);
            }
            orderItemsByOrderId
              .get(orderItem.orderId)
              ?.push(orderItemEntityToOrderItemType(orderItem));
          });

          return orderIds.map((orderId) => {
            const orderItems = orderItemsByOrderId.get(orderId);
            return orderItems ?? null;
          });
        },
      ),
    };
  }
}
