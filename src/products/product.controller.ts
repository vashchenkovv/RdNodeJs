import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { AttachProductFileDto } from './dto/attach-product-file.dto';

@UseGuards(JwtAuthGuard)
@Controller('pruduct')
export class ProductController {
  constructor(private productsService: ProductsService) {}

  @Patch('image')
  async setProductImage(@Body() attachFileDto: AttachProductFileDto) {
    return this.productsService.setImage(
      attachFileDto.productId,
      attachFileDto.fileId,
    );
  }
}
