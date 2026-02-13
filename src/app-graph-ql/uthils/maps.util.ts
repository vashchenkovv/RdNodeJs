import { Order } from 'src/orders/order.entity';
import { OrderType } from '../types/order.type';
import { User } from 'src/users/user.entity';
import { UserType } from '../types/user.type';
import { OrderItem } from 'src/orders/order-item.entity';
import { OrderItemType } from '../types/order-item.type';
import { Product } from 'src/products/product.entity';
import { ProductType } from '../types/product.type';

export function orderEntityToOrderType(entity: Order): OrderType {
  return {
    id: entity.id,
    userId: entity.userId,
    user: null,
    status: entity.status,
    items: [],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function userEntityToUserType(entity: User): UserType {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
  };
}

export function orderItemEntityToOrderItemType(
  entity: OrderItem,
): OrderItemType {
  const price: number = Number(entity.priceSnapshot ?? 0);
  return {
    id: entity.id,
    productId: entity.productId,
    product: null,
    quantity: entity.quantity,
    price: isNaN(price) ? 0 : price,
    total: (entity.quantity ?? 0) * (isNaN(price) ? 0 : price),
  };
}

export function productEntytyToProductType(entity: Product): ProductType {
  return {
    id: entity.id,
    title: entity.title,
    price: entity.price,
  };
}
