// src/events/dto/update-event.dto.ts
import { IsOptional, IsString } from 'class-validator'

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  date?: string

  @IsString()
  @IsOptional()
  time?: string

  @IsString()
  @IsOptional()
  eventCategoryId?: string
}
