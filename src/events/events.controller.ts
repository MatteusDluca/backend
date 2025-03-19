// src/events/events.controller.ts
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
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll() {
    return this.eventsService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id)
  }

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto)
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string) {
    return this.eventsService.delete(id)
  }
}
