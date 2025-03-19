// src/event-categories/dto/update-event-category.dto.ts
import { EventCategoryStatus } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class UpdateEventCategoryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEnum(EventCategoryStatus)
  @IsOptional()
  status?: EventCategoryStatus
}
