import { CategoryStatus } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    status?: CategoryStatus;
    imageUrl?: string;
}
