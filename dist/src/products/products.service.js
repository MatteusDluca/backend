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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const PDFDocument = require("pdfkit");
const categories_service_1 = require("../categories/categories.service");
const path_1 = require("path");
const fs = require("fs");
let ProductsService = class ProductsService {
    prisma;
    uploadService;
    categoriesService;
    constructor(prisma, uploadService, categoriesService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.categoriesService = categoriesService;
    }
    async create(createProductDto) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { code: createProductDto.code },
        });
        if (existingProduct) {
            throw new common_1.ConflictException('Já existe um produto com este código');
        }
        const productData = { ...createProductDto };
        if (productData.categoryId) {
            try {
                await this.categoriesService.findOne(productData.categoryId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    delete productData.categoryId;
                }
                else {
                    throw error;
                }
            }
        }
        else {
            delete productData.categoryId;
        }
        return this.prisma.product.create({
            data: productData,
        });
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        if (updateProductDto.code) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { code: updateProductDto.code },
            });
            if (existingProduct && existingProduct.id !== id) {
                throw new common_1.ConflictException('Já existe um produto com este código');
            }
        }
        if (updateProductDto.categoryId) {
            await this.categoriesService.findOne(updateProductDto.categoryId);
        }
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                category: true,
            },
        });
    }
    async remove(id) {
        const product = await this.findOne(id);
        if (product.imageUrl) {
            await this.uploadService.deleteFile(product.imageUrl);
        }
        await this.prisma.product.delete({
            where: { id },
        });
    }
    async updateImage(id, imageBuffer, fileName) {
        const product = await this.findOne(id);
        if (product.imageUrl) {
            await this.uploadService.deleteFile(product.imageUrl);
        }
        const imageUrl = await this.uploadService.uploadFile(imageBuffer, fileName);
        return this.prisma.product.update({
            where: { id },
            data: { imageUrl },
        });
    }
    async generateProductsPdf() {
        const products = await this.findAll();
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `produtos_${Date.now()}.pdf`;
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.fontSize(20).text('Lista de Produtos', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        const tableTop = 150;
        const tableLeft = 50;
        const columnWidth = 100;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Código', tableLeft, tableTop);
        doc.text('Nome', tableLeft + columnWidth, tableTop);
        doc.text('Status', tableLeft + columnWidth * 2, tableTop);
        doc.text('Valor', tableLeft + columnWidth * 3, tableTop);
        doc.moveDown();
        let currentPosition = tableTop + 20;
        doc.fontSize(10).font('Helvetica');
        for (const product of products) {
            if (currentPosition > 700) {
                doc.addPage();
                currentPosition = 50;
            }
            doc.text(product.code, tableLeft, currentPosition);
            doc.text(product.name, tableLeft + columnWidth, currentPosition);
            doc.text(this.translateStatus(product.status), tableLeft + columnWidth * 2, currentPosition);
            doc.text(`R$ ${product.rentalValue.toFixed(2)}`, tableLeft + columnWidth * 3, currentPosition);
            currentPosition += 20;
        }
        doc
            .fontSize(10)
            .text(`Total de produtos: ${products.length}`, { align: 'right' });
        doc.end();
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
                resolve(fileUrl);
            });
            writeStream.on('error', reject);
        });
    }
    async generateProductPdf(id) {
        const product = await this.findOne(id);
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `produto_${product.code}_${Date.now()}.pdf`;
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc
            .fontSize(20)
            .text(`Detalhes do Produto: ${product.name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        if (product.imageUrl) {
            try {
                const imagePath = product.imageUrl.replace(`${process.env.BASE_URL || 'http://localhost:3000'}/uploads/`, '');
                const fullImagePath = (0, path_1.join)(process.cwd(), 'uploads', imagePath);
                if (fs.existsSync(fullImagePath)) {
                    doc.image(fullImagePath, {
                        fit: [250, 250],
                        align: 'center',
                    });
                    doc.moveDown(2);
                }
            }
            catch (error) {
                console.error('Erro ao carregar imagem do produto:', error);
            }
        }
        doc.fontSize(12);
        doc.text(`Código: ${product.code}`);
        doc.moveDown();
        doc.text(`Status: ${this.translateStatus(product.status)}`);
        doc.moveDown();
        doc.text(`Tamanho: ${product.size}`);
        doc.moveDown();
        doc.text(`Quantidade: ${product.quantity}`);
        doc.moveDown();
        doc.text(`Valor para Aluguel: R$ ${product.rentalValue.toFixed(2)}`);
        doc.moveDown();
        doc.text(`Categoria: ${product.category?.name || 'Não definida'}`);
        doc.moveDown(2);
        if (product.description) {
            doc.fontSize(14).font('Helvetica-Bold').text('Descrição:');
            doc.moveDown();
            doc.fontSize(12).font('Helvetica').text(product.description);
        }
        doc.end();
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
                resolve(fileUrl);
            });
            writeStream.on('error', reject);
        });
    }
    translateStatus(status) {
        const statusMap = {
            AVAILABLE: 'Disponível',
            RENTED: 'Alugado',
            MAINTENANCE: 'Em Conserto',
            DISABLED: 'Desativado',
        };
        return statusMap[status] || status;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        categories_service_1.CategoriesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map