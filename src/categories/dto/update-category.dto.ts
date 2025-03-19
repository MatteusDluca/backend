// src/categories/dto/update-category.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { CategoryStatus } from '@prisma/client'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  name?: string

  @IsOptional()
  @IsEnum(CategoryStatus, { message: 'Status inválido' })
  status?: CategoryStatus

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string' })
  imageUrl?: string
}
