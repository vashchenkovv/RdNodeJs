import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { OrderStatus } from 'src/orders/order.entity';
import { UserType } from './user.type';
import { OrderItemType } from './order-item.type';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserType, { nullable: true })
  user: UserType | null;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => [OrderItemType], { nullable: true })
  items: OrderItemType[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
