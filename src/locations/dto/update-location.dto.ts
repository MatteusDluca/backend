// src/locations/dto/update-location.dto.ts
import { IsOptional, IsString } from 'class-validator'

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  street?: string

  @IsString()
  @IsOptional()
  number?: string

  @IsString()
  @IsOptional()
  complement?: string

  @IsString()
  @IsOptional()
  zipCode?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsString()
  @IsOptional()
  state?: string
}
