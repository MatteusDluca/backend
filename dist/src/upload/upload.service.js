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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const fs = require("fs/promises");
const uuid_1 = require("uuid");
let UploadService = class UploadService {
    uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    constructor() {
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file, fileName) {
        const fileExtension = fileName.split('.').pop();
        const fileId = (0, uuid_1.v4)();
        const newFileName = `${fileId}.${fileExtension}`;
        const filePath = (0, path_1.join)(this.uploadDir, newFileName);
        await fs.writeFile(filePath, file);
        return `${this.baseUrl}/uploads/${newFileName}`;
    }
    async deleteFile(fileUrl) {
        const fileName = fileUrl.split('/').pop();
        if (!fileName)
            return;
        const filePath = (0, path_1.join)(this.uploadDir, fileName);
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        }
        catch (error) {
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadService);
//# sourceMappingURL=upload.service.js.map