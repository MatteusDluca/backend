import { IsEmail, IsOptional, IsNumber, IsString } from 'class-validator'

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  cpfCnpj?: string

  @IsOptional()
  @IsString()
  instagram?: string

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
