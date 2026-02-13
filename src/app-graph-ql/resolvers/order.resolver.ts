import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderType } from '../types/order.type';
import { AppGraphQlService } from '../app-graph-ql.service';
import { UserType } from '../types/user.type';
import { OrderItemType } from '../types/order-item.type';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private gqlService: AppGraphQlService) {}

  @Query(() => [OrderType], { nullable: true })
  async orders(): Promise<OrderType[] | null> {
    return this.gqlService.getAllOreders();
  }

  @ResolveField(() => UserType, { nullable: true })
  async user(@Parent() order: OrderType): Promise<UserType | null> {
    return this.gqlService.getUserByID(order.userId);
  }

  @ResolveField(() => [OrderItemType], { nullable: true })
  async items(@Parent() order: OrderType): Promise<OrderItemType[] | null> {
    return this.gqlService.getOrderItemByOrderID(order.id);
  }
}
