import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

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
