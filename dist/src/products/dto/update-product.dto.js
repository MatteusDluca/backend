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
exports.UpdateProductDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateProductDto {
    name;
    code;
    status;
    size;
    quantity;
    description;
    imageUrl;
    rentalValue;
    categoryId;
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O nome deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O código deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus, { message: 'Status inválido' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O tamanho deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'A quantidade deve ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'A quantidade não pode ser negativa' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A URL da imagem deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'O valor de aluguel deve ser um número' }),
    (0, class_validator_1.IsPositive)({ message: 'O valor de aluguel deve ser positivo' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "rentalValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O ID da categoria deve ser uma string' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "categoryId", void 0);
//# sourceMappingURL=update-product.dto.js.map