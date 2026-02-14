import {
  Args,
  Context,
  ID,
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
import { OrderArgsType } from '../types/order-args.type';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private gqlService: AppGraphQlService) {}

  @Query(() => [OrderType], { nullable: true })
  async orders(
    @Args() orderArgsType: OrderArgsType,
  ): Promise<OrderType[] | null> {
    return this.gqlService.getAllOreders(orderArgsType);
  }

  @Query(() => [OrderType], { nullable: true })
  async ordersNaive(
    @Args() orderArgsType: OrderArgsType,
    @Context() ctx: GraphQLContext,
  ): Promise<OrderType[] | null> {
    ctx.strategy = 'naive';
    return this.gqlService.getAllOreders(orderArgsType);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => OrderType)
  async order(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: GraphQLContext,
  ): Promise<OrderType | null> {
    return this.gqlService.getOrderByID(id, ctx.req.user);
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
