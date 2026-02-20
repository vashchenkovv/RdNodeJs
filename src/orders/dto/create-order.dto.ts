import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../order.entity';
import { OrderStatusValidator } from '../validators/order-status.validator';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsPositive()
  @IsNumber()
  quantity: number;

  @IsPositive()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsEmail()
  userEmail: string;

  @ValidateNested()
  @IsArray()
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  idempotencyKey: string;
}

export class UpdateOrderStatusDto {
  @Validate(OrderStatusValidator)
  status: OrderStatus;
}
