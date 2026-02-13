import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderItemType } from '../types/order-item.type';
import { ProductType } from '../types/product.type';
import { AppGraphQlService } from '../app-graph-ql.service';
import type { GraphQLContext } from '../loaders/loadersFactory';

@Resolver(() => OrderItemType)
export class OrderItemResolver {
  constructor(private gqlService: AppGraphQlService) {}

  @ResolveField(() => ProductType, { nullable: true })
  async product(
    @Parent() orderItem: OrderItemType,
    @Context() ctx: GraphQLContext,
  ): Promise<ProductType | null> {
    if (ctx.strategy === 'naive') {
      return this.gqlService.getProductByID(orderItem.productId);
    }
    return ctx.loaders.productByIdLoader.load(orderItem.productId);
  }
}
