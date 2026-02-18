import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { ProductController } from './product.controller';
import { ProductsService } from './products.service';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderItem]), FilesModule],
  controllers: [ProductController],
  providers: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
