// src/events/events.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Event } from '@prisma/client'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany({
      include: {
        eventCategory: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        eventCategory: true,
      },
    })
  }

  async create(data: CreateEventDto): Promise<Event> {
    return this.prisma.event.create({
      data,
      include: {
        eventCategory: true,
      },
    })
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        eventCategory: true,
      },
    })
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({
      where: { id },
    })
  }
}
