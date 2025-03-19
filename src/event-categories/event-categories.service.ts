// src/event-categories/event-categories.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EventCategory, EventCategoryStatus } from '@prisma/client'

@Injectable()
export class EventCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<EventCategory[]> {
    return this.prisma.eventCategory.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string): Promise<EventCategory | null> {
    return this.prisma.eventCategory.findUnique({
      where: { id },
    })
  }

  async create(data: {
    name: string
    status?: EventCategoryStatus
  }): Promise<EventCategory> {
    return this.prisma.eventCategory.create({
      data,
    })
  }

  async update(
    id: string,
    data: { name?: string; status?: EventCategoryStatus },
  ): Promise<EventCategory> {
    return this.prisma.eventCategory.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<EventCategory> {
    return this.prisma.eventCategory.delete({
      where: { id },
    })
  }
}
