// src/products/dto/update-product.dto.ts
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator'
import { ProductStatus } from '@prisma/client'

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  name?: string

  @IsOptional()
  @IsString({ message: 'O código deve ser uma string' })
  code?: string

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status inválido' })
  status?: ProductStatus

  @IsOptional()
  @IsString({ message: 'O tamanho deve ser uma string' })
  size?: string

  @IsOptional()
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0, { message: 'A quantidade não pode ser negativa' })
  quantity?: number

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string' })
  imageUrl?: string

  @IsOptional()
  @IsNumber({}, { message: 'O valor de aluguel deve ser um número' })
  @IsPositive({ message: 'O valor de aluguel deve ser positivo' })
  rentalValue?: number

  @IsOptional()
  @IsString({ message: 'O ID da categoria deve ser uma string' })
  categoryId?: string
}
