// src/locations/locations.controller.ts
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
import { LocationsService } from './locations.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll() {
    return this.locationsService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id)
  }

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto)
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, updateLocationDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string) {
    return this.locationsService.delete(id)
  }
}
