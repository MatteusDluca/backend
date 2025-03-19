// src/contracts/dto/create-contract.dto.ts
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
  }
  
  export enum PaymentMethod {
    PIX = 'PIX',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH'
  }
  
  export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED'
  }

// src/contracts/dto/filter-contracts.dto.ts
export class FilterContractsDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(ContractStatus, { each: true })
  status?: ContractStatus[]

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsUUID()
  clientId?: string

  @IsOptional()
  @IsUUID()
  eventId?: string
}
