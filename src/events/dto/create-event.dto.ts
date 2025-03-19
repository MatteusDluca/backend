// src/events/dto/create-event.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string

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
