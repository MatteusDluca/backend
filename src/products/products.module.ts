// src/products/products.module.ts
import { Module } from '@nestjs/common'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { UploadModule } from '../upload/upload.module'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [PrismaModule, UploadModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
