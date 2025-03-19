import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsNotEmpty()
  @IsString()
  cpfCnpj: string

  @IsOptional()
  @IsString()
  instagram?: string

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

  // Medidas
  @IsOptional()
  @IsNumber()
  shoulder?: number

  @IsOptional()
  @IsNumber()
  bust?: number

  @IsOptional()
  @IsNumber()
  shoulderToWaistLength?: number

  @IsOptional()
  @IsNumber()
  shoulderToCosLength?: number

  @IsOptional()
  @IsNumber()
  tqcLength?: number

  @IsOptional()
  @IsNumber()
  waist?: number

  @IsOptional()
  @IsNumber()
  cos?: number

  @IsOptional()
  @IsNumber()
  hip?: number

  @IsOptional()
  @IsNumber()
  shortSkirtLength?: number

  @IsOptional()
  @IsNumber()
  longSkirtLength?: number

  @IsOptional()
  @IsNumber()
  shortLength?: number

  @IsOptional()
  @IsNumber()
  pantsLength?: number

  @IsOptional()
  @IsNumber()
  dressLength?: number

  @IsOptional()
  @IsNumber()
  sleeveLength?: number

  @IsOptional()
  @IsNumber()
  wrist?: number

  @IsOptional()
  @IsNumber()
  frontMeasure?: number

  @IsOptional()
  @IsNumber()
  shoulderToShoulderWidth?: number
}
