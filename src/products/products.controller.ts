// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { Role } from '@prisma/client'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/role.guard'

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.productsService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.USER)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }

  @Post(':id/image')
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.updateImage(id, file.buffer, file.originalname)
  }

  @Get('pdf/all')
  @Roles(Role.ADMIN, Role.USER)
  async generateProductsPdf() {
    const pdfUrl = await this.productsService.generateProductsPdf()
    return { url: pdfUrl }
  }

  @Get(':id/pdf')
  @Roles(Role.ADMIN, Role.USER)
  async generateProductPdf(@Param('id') id: string) {
    const pdfUrl = await this.productsService.generateProductPdf(id)
    return { url: pdfUrl }
  }
}
