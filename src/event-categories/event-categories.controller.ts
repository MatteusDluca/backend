// src/event-categories/event-categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { EventCategoriesService } from './event-categories.service'
import { CreateEventCategoryDto } from './dto/create-event-category.dto'
import { UpdateEventCategoryDto } from './dto/update-event-category.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@Controller('event-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventCategoriesController {
  constructor(private eventCategoriesService: EventCategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll() {
    return this.eventCategoriesService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    return this.eventCategoriesService.findOne(id)
  }

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async create(@Body() createEventCategoryDto: CreateEventCategoryDto) {
    return this.eventCategoriesService.create(createEventCategoryDto)
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateEventCategoryDto: UpdateEventCategoryDto,
  ) {
    return this.eventCategoriesService.update(id, updateEventCategoryDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string) {
    return this.eventCategoriesService.delete(id)
  }
}
