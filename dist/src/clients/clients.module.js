"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const clients_service_1 = require("./clients.service");
const clients_controller_1 = require("./clients.controller");
const fs_1 = require("fs");
const uploadsDir = './uploads';
const clientUploadsDir = './uploads/clients';
if (!(0, fs_1.existsSync)(uploadsDir)) {
    (0, fs_1.mkdirSync)(uploadsDir);
}
if (!(0, fs_1.existsSync)(clientUploadsDir)) {
    (0, fs_1.mkdirSync)(clientUploadsDir);
}
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                dest: './uploads/clients',
            }),
        ],
        controllers: [clients_controller_1.ClientsController],
        providers: [clients_service_1.ClientsService],
    })
], ClientsModule);
//# sourceMappingURL=clients.module.js.map