import { EventCategoryStatus } from '@prisma/client';
export declare class CreateEventCategoryDto {
    name: string;
    status?: EventCategoryStatus;
}
