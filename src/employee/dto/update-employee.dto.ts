import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { Role } from '@prisma/client'

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  cpf?: string

  @IsOptional()
  @IsNumber()
  salary?: number

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  birthday?: string

  @IsOptional()
  @IsString()
  workHours?: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @IsString()
  imageUrl?: string

  // Endereço
  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsString()
  complement?: string

  @IsOptional()
  @IsString()
  zipCode?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string
}
