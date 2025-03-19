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
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  // Definimos os enums localmente para evitar importação do Prisma
  export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
  }
  
  export enum PaymentMethod {
    PIX = 'PIX',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH',
  }
  
  export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
  }
  
  export class CreateContractItemDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;
  
    @IsNumber()
    @IsPositive()
    quantity: number;
  
    @IsNumber()
    @IsPositive()
    unitValue: number;
  }
  
  export class CreatePaymentDto {
    @IsEnum(PaymentMethod)
    method: PaymentMethod;
  
    @IsNumber()
    @IsPositive()
    totalValue: number;
  
    @IsEnum(DiscountType)
    @IsOptional()
    discountType?: DiscountType;
  
    @IsNumber()
    @IsOptional()
    discountValue?: number;
  
    @IsNumber()
    @IsPositive()
    finalValue: number;
  
    @IsString()
    @IsOptional()
    notes?: string;
  }
  
  export class CreateContractDto {
    @IsUUID()
    @IsNotEmpty()
    clientId: string;
  
    @IsUUID()
    @IsOptional()
    eventId?: string;
  
    @IsUUID()
    @IsOptional()
    locationId?: string;
  
    @IsEnum(ContractStatus)
    @IsOptional()
    status?: ContractStatus;
  
    @IsDateString()
    @IsOptional()
    fittingDate?: string;
  
    @IsDateString()
    @IsNotEmpty()
    pickupDate: string;
  
    @IsDateString()
    @IsNotEmpty()
    returnDate: string;
  
    @IsBoolean()
    @IsOptional()
    needsAdjustment?: boolean;
  
    @IsString()
    @IsOptional()
    observations?: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateContractItemDto)
    items: CreateContractItemDto[];
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePaymentDto)
    payments: CreatePaymentDto[];
  }