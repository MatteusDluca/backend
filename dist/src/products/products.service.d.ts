import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadService } from '../upload/upload.service';
import { Product } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
export declare class ProductsService {
    private prisma;
    private uploadService;
    private categoriesService;
    constructor(prisma: PrismaService, uploadService: UploadService, categoriesService: CategoriesService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    updateImage(id: string, imageBuffer: Buffer, fileName: string): Promise<Product>;
    generateProductsPdf(): Promise<string>;
    generateProductPdf(id: string): Promise<string>;
    private translateStatus;
}
