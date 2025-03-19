// src/event-categories/dto/create-event-category.dto.ts
import { EventCategoryStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateEventCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(EventCategoryStatus)
  @IsOptional()
  status?: EventCategoryStatus
}
