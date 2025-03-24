import { PrismaService } from '../prisma/prisma.service';
import { EventCategory, EventCategoryStatus } from '@prisma/client';
export declare class EventCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<EventCategory[]>;
    findOne(id: string): Promise<EventCategory | null>;
    create(data: {
        name: string;
        status?: EventCategoryStatus;
    }): Promise<EventCategory>;
    update(id: string, data: {
        name?: string;
        status?: EventCategoryStatus;
    }): Promise<EventCategory>;
    delete(id: string): Promise<EventCategory>;
}
