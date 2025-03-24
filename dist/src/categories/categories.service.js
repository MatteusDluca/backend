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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
let CategoriesService = class CategoriesService {
    prisma;
    uploadService;
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { name: createCategoryDto.name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Já existe uma categoria com este nome');
        }
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Categoria com ID ${id} não encontrada`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        await this.findOne(id);
        if (updateCategoryDto.name) {
            const existingCategory = await this.prisma.category.findUnique({
                where: { name: updateCategoryDto.name },
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new common_1.ConflictException('Já existe uma categoria com este nome');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        const category = await this.findOne(id);
        if (category.imageUrl) {
            await this.uploadService.deleteFile(category.imageUrl);
        }
        await this.prisma.category.delete({
            where: { id },
        });
    }
    async updateImage(id, imageBuffer, fileName) {
        const category = await this.findOne(id);
        if (category.imageUrl) {
            await this.uploadService.deleteFile(category.imageUrl);
        }
        const imageUrl = await this.uploadService.uploadFile(imageBuffer, fileName);
        return this.prisma.category.update({
            where: { id },
            data: { imageUrl },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map