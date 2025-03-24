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
exports.FilterContractsDto = exports.DiscountType = exports.PaymentMethod = exports.ContractStatus = void 0;
const class_validator_1 = require("class-validator");
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
class FilterContractsDto {
    search;
    status;
    startDate;
    endDate;
    clientId;
    eventId;
}
exports.FilterContractsDto = FilterContractsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterContractsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ContractStatus, { each: true }),
    __metadata("design:type", Array)
], FilterContractsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterContractsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterContractsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FilterContractsDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FilterContractsDto.prototype, "eventId", void 0);
//# sourceMappingURL=filter-contracts.dto.js.map