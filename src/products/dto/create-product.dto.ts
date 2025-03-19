// src/products/dto/create-product.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator'
import { ProductStatus } from '@prisma/client'

export class CreateProductDto {
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  name: string

  @IsNotEmpty({ message: 'O código do produto é obrigatório' })
  @IsString({ message: 'O código deve ser uma string' })
  code: string

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status inválido' })
  status?: ProductStatus

  @IsNotEmpty({ message: 'O tamanho do produto é obrigatório' })
  @IsString({ message: 'O tamanho deve ser uma string' })
  size: string

  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0, { message: 'A quantidade não pode ser negativa' })
  quantity: number

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string' })
  imageUrl?: string

  @IsNotEmpty({ message: 'O valor de aluguel é obrigatório' })
  @IsNumber({}, { message: 'O valor de aluguel deve ser um número' })
  @IsPositive({ message: 'O valor de aluguel deve ser positivo' })
  rentalValue: number

  @IsOptional()
  @IsString({ message: 'O ID da categoria deve ser uma string' })
  categoryId?: string
}
