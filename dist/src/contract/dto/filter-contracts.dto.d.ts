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
export declare class FilterContractsDto {
    search?: string;
    status?: ContractStatus[];
    startDate?: string;
    endDate?: string;
    clientId?: string;
    eventId?: string;
}
