import { IsString } from 'class-validator';

export class AttachProductFileDto {
  @IsString()
  fileId: string;

  @IsString()
  productId: string;
}
