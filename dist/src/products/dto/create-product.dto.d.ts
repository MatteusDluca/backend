import { ProductStatus } from '@prisma/client';
export declare class CreateProductDto {
    name: string;
    code: string;
    status?: ProductStatus;
    size: string;
    quantity: number;
    description?: string;
    imageUrl?: string;
    rentalValue: number;
    categoryId?: string;
}
