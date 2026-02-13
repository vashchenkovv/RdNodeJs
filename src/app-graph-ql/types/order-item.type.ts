import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field()
  productId: string;

  @Field()
  productTitle: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  price: number;

  @Field()
  total: number;
}
