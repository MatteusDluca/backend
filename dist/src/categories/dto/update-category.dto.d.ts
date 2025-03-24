import { CategoryStatus } from '@prisma/client';
export declare class UpdateCategoryDto {
    name?: string;
    status?: CategoryStatus;
    imageUrl?: string;
}
