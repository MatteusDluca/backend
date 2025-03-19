// src/categories/dto/create-category.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { CategoryStatus } from '@prisma/client'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  name: string

  @IsOptional()
  @IsEnum(CategoryStatus, { message: 'Status inválido' })
  status?: CategoryStatus

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string' })
  imageUrl?: string
}
