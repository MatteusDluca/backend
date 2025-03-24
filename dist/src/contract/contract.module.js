"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const contract_service_1 = require("./contract.service");
const contract_controller_1 = require("./contract.controller");
const uploadsDir = './uploads';
const templatesDir = './uploads/templates';
if (!(0, fs_1.existsSync)(uploadsDir)) {
    (0, fs_1.mkdirSync)(uploadsDir);
}
if (!(0, fs_1.existsSync)(templatesDir)) {
    (0, fs_1.mkdirSync)(templatesDir);
}
let ContractsModule = class ContractsModule {
};
exports.ContractsModule = ContractsModule;
exports.ContractsModule = ContractsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads/templates',
                    filename: (req, file, cb) => {
                        const uniqueSuffix = (0, uuid_1.v4)();
                        const ext = (0, path_1.extname)(file.originalname);
                        cb(null, `template-${uniqueSuffix}${ext}`);
                    },
                }),
            }),
        ],
        controllers: [contract_controller_1.ContractController],
        providers: [contract_service_1.ContractsService],
        exports: [contract_service_1.ContractsService],
    })
], ContractsModule);
//# sourceMappingURL=contract.module.js.map