import { PrismaService } from '../prisma/prisma.service';
import { Event } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Event[]>;
    findOne(id: string): Promise<Event | null>;
    create(data: CreateEventDto): Promise<Event>;
    update(id: string, data: UpdateEventDto): Promise<Event>;
    delete(id: string): Promise<Event>;
}
