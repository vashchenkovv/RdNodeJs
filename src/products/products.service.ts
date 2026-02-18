import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private filesService: FilesService,
  ) {}

  async setImage(
    productId: string,
    fileId: string,
  ): Promise<{ productFileId: string; avatarUrl: string }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const file = await this.filesService.getProductFile(fileId);
    product.productFileId = file.id;
    await this.productRepository.save(product);

    return {
      productFileId: file.id,
      avatarUrl: this.filesService.buildPublicUrl(file.objectKey),
    };
  }
}
