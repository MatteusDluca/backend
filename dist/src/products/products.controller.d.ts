import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        code: string;
        size: string;
        quantity: number;
        description: string | null;
        rentalValue: number;
        categoryId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        code: string;
        size: string;
        quantity: number;
        description: string | null;
        rentalValue: number;
        categoryId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        code: string;
        size: string;
        quantity: number;
        description: string | null;
        rentalValue: number;
        categoryId: string | null;
    }>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        code: string;
        size: string;
        quantity: number;
        description: string | null;
        rentalValue: number;
        categoryId: string | null;
    }>;
    remove(id: string): Promise<void>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        code: string;
        size: string;
        quantity: number;
        description: string | null;
        rentalValue: number;
        categoryId: string | null;
    }>;
    generateProductsPdf(): Promise<{
        url: string;
    }>;
    generateProductPdf(id: string): Promise<{
        url: string;
    }>;
}
