import { ArgsType, Field, GraphQLISODateTime, Int } from '@nestjs/graphql';
import { OrderStatus } from 'src/orders/order.entity';

@ArgsType()
export class OrderArgsType {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateFrom?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateTo?: string;

  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;

  @Field(() => Int, { defaultValue: 0 })
  offset: number = 0;
}
