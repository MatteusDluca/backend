import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { Role } from '@prisma/client'

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  cpf: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsNumber()
  salary: number

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsOptional()
  @IsString()
  birthday?: string

  @IsNotEmpty()
  @IsString()
  workHours: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @IsString()
  imageUrl?: string

  // Endereço
  @IsNotEmpty()
  @IsString()
  street: string

  @IsNotEmpty()
  @IsString()
  number: string

  @IsOptional()
  @IsString()
  complement?: string

  @IsNotEmpty()
  @IsString()
  zipCode: string

  @IsNotEmpty()
  @IsString()
  city: string

  @IsNotEmpty()
  @IsString()
  state: string
}
