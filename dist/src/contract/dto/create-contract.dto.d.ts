export declare enum ContractStatus {
    ACTIVE = "ACTIVE",
    CANCELED = "CANCELED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}
export declare enum PaymentMethod {
    PIX = "PIX",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    CASH = "CASH"
}
export declare enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED"
}
export declare class CreateContractItemDto {
    productId: string;
    quantity: number;
    unitValue: number;
}
export declare class CreatePaymentDto {
    method: PaymentMethod;
    totalValue: number;
    discountType?: DiscountType;
    discountValue?: number;
    finalValue: number;
    notes?: string;
}
export declare class CreateContractDto {
    clientId: string;
    eventId?: string;
    locationId?: string;
    status?: ContractStatus;
    fittingDate?: string;
    pickupDate: string;
    returnDate: string;
    needsAdjustment?: boolean;
    observations?: string;
    items: CreateContractItemDto[];
    payments: CreatePaymentDto[];
}
