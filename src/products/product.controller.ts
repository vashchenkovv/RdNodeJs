import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { AttachProductFileDto } from './dto/attach-product-file.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLES } from 'src/auth/enums/roles.enum';
import { ScopesGuard } from 'src/auth/scope.guard';
import { ROLE_SCOPE } from 'src/auth/enums/role-scope.enum';
import { Scopes } from 'src/auth/scopes.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, ScopesGuard)
@Controller('pruduct')
export class ProductController {
  constructor(private productsService: ProductsService) {}

  @Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT)
  @Scopes(ROLE_SCOPE.FILE_UPLOAD)
  @Patch('image')
  async setProductImage(@Body() attachFileDto: AttachProductFileDto) {
    return this.productsService.setImage(
      attachFileDto.productId,
      attachFileDto.fileId,
    );
  }
}
