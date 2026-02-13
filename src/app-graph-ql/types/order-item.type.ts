import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductType } from './product.type';

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field()
  productId: string;

  @Field(() => ProductType, { nullable: true })
  product: ProductType | null;

  @Field(() => Int)
  quantity: number;

  @Field()
  price: number;

  @Field()
  total: number;
}
