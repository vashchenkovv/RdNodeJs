import { IsString } from 'class-validator';

export class OrderIdempotencyDto {
  @IsString()
  idempotencyKey: string;
}
