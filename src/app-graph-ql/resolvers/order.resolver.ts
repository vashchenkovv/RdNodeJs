import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { OrderType } from '../types/order.type';
import { AppGraphQlService } from '../app-graph-ql.service';
import { UserType } from '../types/user.type';
import { OrderItemType } from '../types/order-item.type';
import type { GraphQLContext } from '../loaders/loadersFactory';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private gqlService: AppGraphQlService) {}

  @Query(() => [OrderType], { nullable: true })
  async orders(): Promise<OrderType[] | null> {
    return this.gqlService.getAllOreders();
  }

  @Query(() => [OrderType], { nullable: true })
  async ordersNaive(
    @Context() ctx: GraphQLContext,
  ): Promise<OrderType[] | null> {
    ctx.strategy = 'naive';
    return this.gqlService.getAllOreders();
  }

  @ResolveField(() => UserType, { nullable: true })
  async user(
    @Parent() order: OrderType,
    @Context() ctx: GraphQLContext,
  ): Promise<UserType | null> {
    if (ctx.strategy === 'naive') {
      return this.gqlService.getUserByID(order.userId);
    }

    return ctx.loaders.userByIdLoader.load(order.userId);
  }

  @ResolveField(() => [OrderItemType], { nullable: true })
  async items(
    @Parent() order: OrderType,
    @Context() ctx: GraphQLContext,
  ): Promise<OrderItemType[] | null> {
    if (ctx.strategy === 'naive') {
      return this.gqlService.getOrderItemByOrderID(order.id);
    }
    return ctx.loaders.orderItemByIdLoader.load(order.id);
  }
}
