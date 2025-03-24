import { EventCategoriesService } from './event-categories.service';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';
export declare class EventCategoriesController {
    private eventCategoriesService;
    constructor(eventCategoriesService: EventCategoriesService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EventCategoryStatus;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EventCategoryStatus;
    } | null>;
    create(createEventCategoryDto: CreateEventCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EventCategoryStatus;
    }>;
    update(id: string, updateEventCategoryDto: UpdateEventCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EventCategoryStatus;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EventCategoryStatus;
    }>;
}
