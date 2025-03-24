"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContractDto = exports.CreatePaymentDto = exports.CreateContractItemDto = exports.DiscountType = exports.PaymentMethod = exports.ContractStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["ACTIVE"] = "ACTIVE";
    ContractStatus["CANCELED"] = "CANCELED";
    ContractStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ContractStatus["COMPLETED"] = "COMPLETED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["PIX"] = "PIX";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["CASH"] = "CASH";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED"] = "FIXED";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
class CreateContractItemDto {
    productId;
    quantity;
    unitValue;
}
exports.CreateContractItemDto = CreateContractItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContractItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateContractItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateContractItemDto.prototype, "unitValue", void 0);
class CreatePaymentDto {
    method;
    totalValue;
    discountType;
    discountValue;
    finalValue;
    notes;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "totalValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DiscountType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "discountType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "discountValue", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "finalValue", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "notes", void 0);
class CreateContractDto {
    clientId;
    eventId;
    locationId;
    status;
    fittingDate;
    pickupDate;
    returnDate;
    needsAdjustment;
    observations;
    items;
    payments;
}
exports.CreateContractDto = CreateContractDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ContractStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "fittingDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "returnDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateContractDto.prototype, "needsAdjustment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContractDto.prototype, "observations", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateContractItemDto),
    __metadata("design:type", Array)
], CreateContractDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePaymentDto),
    __metadata("design:type", Array)
], CreateContractDto.prototype, "payments", void 0);
//# sourceMappingURL=create-contract.dto.js.map