import { IsIn, IsNumber, IsPositive, Max } from 'class-validator';
import { ALLOWED_CONTENT_TYPES, FILE_KIND } from '../files.service';

const maxImageBytes = 5 * 1024 * 1024;

export class PresignFileDto {
  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType: string;

  @IsNumber()
  @IsPositive()
  @Max(maxImageBytes)
  sizeBytes: number;

  @IsIn(Object.values(FILE_KIND))
  kind: FILE_KIND;
}
