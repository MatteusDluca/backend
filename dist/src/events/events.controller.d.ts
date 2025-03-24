import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        date: string | null;
        time: string | null;
        eventCategoryId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        date: string | null;
        time: string | null;
        eventCategoryId: string | null;
    } | null>;
    create(createEventDto: CreateEventDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        date: string | null;
        time: string | null;
        eventCategoryId: string | null;
    }>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        date: string | null;
        time: string | null;
        eventCategoryId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        date: string | null;
        time: string | null;
        eventCategoryId: string | null;
    }>;
}
