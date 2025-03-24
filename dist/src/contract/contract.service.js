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
exports.ContractsService = exports.DiscountType = exports.PaymentMethod = exports.ContractStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PDFDocument = require("pdfkit");
const path_1 = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
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
let ContractsService = class ContractsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createContractDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: createContractDto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente com ID ${createContractDto.clientId} não encontrado`);
        }
        if (createContractDto.eventId) {
            const event = await this.prisma.event.findUnique({
                where: { id: createContractDto.eventId },
            });
            if (!event) {
                throw new common_1.NotFoundException(`Evento com ID ${createContractDto.eventId} não encontrado`);
            }
        }
        if (createContractDto.locationId) {
            const location = await this.prisma.location.findUnique({
                where: { id: createContractDto.locationId },
            });
            if (!location) {
                throw new common_1.NotFoundException(`Local com ID ${createContractDto.locationId} não encontrado`);
            }
        }
        const productIds = createContractDto.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
            throw new common_1.NotFoundException('Um ou mais produtos não foram encontrados');
        }
        const unavailableProducts = products.filter((p) => p.status !== 'AVAILABLE' && p.status !== 'RENTED');
        if (unavailableProducts.length > 0) {
            throw new common_1.BadRequestException(`Os seguintes produtos não estão disponíveis para aluguel: ${unavailableProducts
                .map((p) => p.name)
                .join(', ')}`);
        }
        const insufficientProducts = [];
        for (const item of createContractDto.items) {
            const product = products.find((p) => p.id === item.productId);
            if (product && product.quantity < item.quantity) {
                insufficientProducts.push(product.name);
            }
        }
        if (insufficientProducts.length > 0) {
            throw new common_1.BadRequestException(`Quantidade insuficiente para os produtos: ${insufficientProducts.join(', ')}`);
        }
        const pickupDate = new Date(createContractDto.pickupDate);
        const returnDate = new Date(createContractDto.returnDate);
        if (returnDate <= pickupDate) {
            throw new common_1.BadRequestException('A data de devolução deve ser posterior à data de retirada');
        }
        if (createContractDto.fittingDate) {
            const fittingDate = new Date(createContractDto.fittingDate);
            if (fittingDate > pickupDate) {
                throw new common_1.BadRequestException('A data da prova deve ser anterior ou igual à data de retirada');
            }
        }
        for (const payment of createContractDto.payments) {
            if (payment.discountType && payment.discountValue) {
                let calculatedFinalValue;
                if (payment.discountType === DiscountType.PERCENTAGE) {
                    if (payment.discountValue < 0 || payment.discountValue > 100) {
                        throw new common_1.BadRequestException('O valor do desconto percentual deve estar entre 0 e 100');
                    }
                    calculatedFinalValue = payment.totalValue * (1 - payment.discountValue / 100);
                }
                else {
                    if (payment.discountValue > payment.totalValue) {
                        throw new common_1.BadRequestException('O valor do desconto não pode ser maior que o valor total');
                    }
                    calculatedFinalValue = payment.totalValue - payment.discountValue;
                }
                const difference = Math.abs(calculatedFinalValue - payment.finalValue);
                if (difference > 0.01) {
                    throw new common_1.BadRequestException('O valor final do pagamento não corresponde ao cálculo do desconto aplicado');
                }
            }
            else if (!payment.discountType && !payment.discountValue) {
                if (payment.totalValue !== payment.finalValue) {
                    throw new common_1.BadRequestException('Sem desconto aplicado, o valor final deve ser igual ao valor total');
                }
            }
            else {
                throw new common_1.BadRequestException('Tipo de desconto e valor de desconto devem ser ambos fornecidos ou ambos omitidos');
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const contractData = {
                    clientId: createContractDto.clientId,
                    eventId: createContractDto.eventId,
                    locationId: createContractDto.locationId,
                    status: createContractDto.status || ContractStatus.ACTIVE,
                    fittingDate: createContractDto.fittingDate ? new Date(createContractDto.fittingDate) : null,
                    pickupDate: new Date(createContractDto.pickupDate),
                    returnDate: new Date(createContractDto.returnDate),
                    needsAdjustment: createContractDto.needsAdjustment || false,
                    observations: createContractDto.observations,
                };
                const contract = await tx.contract.create({
                    data: contractData,
                });
                for (const item of createContractDto.items) {
                    await tx.contractItem.create({
                        data: {
                            contractId: contract.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitValue: item.unitValue,
                        },
                    });
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { status: 'RENTED' },
                    });
                }
                for (const payment of createContractDto.payments) {
                    await tx.payment.create({
                        data: {
                            contractId: contract.id,
                            method: payment.method,
                            totalValue: payment.totalValue,
                            discountType: payment.discountType,
                            discountValue: payment.discountValue,
                            finalValue: payment.finalValue,
                            notes: payment.notes,
                        },
                    });
                }
                return await tx.contract.findUnique({
                    where: { id: contract.id },
                    include: {
                        client: true,
                        event: true,
                        location: true,
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        payments: true,
                    },
                });
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Recurso não encontrado');
            }
            throw error;
        }
    }
    async findAll(filters) {
        const where = {};
        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate);
            }
        }
        if (filters.clientId) {
            where.clientId = filters.clientId;
        }
        if (filters.eventId) {
            where.eventId = filters.eventId;
        }
        if (filters.search) {
            where.OR = [
                {
                    client: {
                        name: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    items: {
                        some: {
                            product: {
                                name: {
                                    contains: filters.search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                },
                {
                    items: {
                        some: {
                            product: {
                                code: {
                                    contains: filters.search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                },
                {
                    event: {
                        name: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    location: {
                        name: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }
        return await this.prisma.contract.findMany({
            where,
            include: {
                client: true,
                event: true,
                location: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: {
                client: {
                    include: {
                        address: {
                            include: {
                                street: true,
                                city: {
                                    include: {
                                        state: true,
                                    },
                                },
                            },
                        },
                        measurements: true,
                    },
                },
                event: true,
                location: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });
        if (!contract) {
            throw new common_1.NotFoundException(`Contrato com ID ${id} não encontrado`);
        }
        return contract;
    }
    async update(id, updateContractDto) {
        await this.findOne(id);
        if (updateContractDto.clientId) {
            const client = await this.prisma.client.findUnique({
                where: { id: updateContractDto.clientId },
            });
            if (!client) {
                throw new common_1.NotFoundException(`Cliente com ID ${updateContractDto.clientId} não encontrado`);
            }
        }
        if (updateContractDto.eventId) {
            const event = await this.prisma.event.findUnique({
                where: { id: updateContractDto.eventId },
            });
            if (!event) {
                throw new common_1.NotFoundException(`Evento com ID ${updateContractDto.eventId} não encontrado`);
            }
        }
        if (updateContractDto.locationId) {
            const location = await this.prisma.location.findUnique({
                where: { id: updateContractDto.locationId },
            });
            if (!location) {
                throw new common_1.NotFoundException(`Local com ID ${updateContractDto.locationId} não encontrado`);
            }
        }
        let pickupDate, returnDate, fittingDate;
        const currentContract = await this.prisma.contract.findUnique({
            where: { id },
            select: {
                pickupDate: true,
                returnDate: true,
                fittingDate: true,
            },
        });
        if (!currentContract) {
            throw new common_1.NotFoundException(`Contrato com ID ${id} não encontrado`);
        }
        if (updateContractDto.pickupDate) {
            pickupDate = new Date(updateContractDto.pickupDate);
        }
        else {
            pickupDate = currentContract.pickupDate;
        }
        if (updateContractDto.returnDate) {
            returnDate = new Date(updateContractDto.returnDate);
        }
        else {
            returnDate = currentContract.returnDate;
        }
        if (returnDate <= pickupDate) {
            throw new common_1.BadRequestException('A data de devolução deve ser posterior à data de retirada');
        }
        if (updateContractDto.fittingDate) {
            fittingDate = new Date(updateContractDto.fittingDate);
            if (fittingDate > pickupDate) {
                throw new common_1.BadRequestException('A data da prova deve ser anterior ou igual à data de retirada');
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const contractData = {
                    clientId: updateContractDto.clientId,
                    eventId: updateContractDto.eventId,
                    locationId: updateContractDto.locationId,
                    status: updateContractDto.status,
                    fittingDate: updateContractDto.fittingDate ? new Date(updateContractDto.fittingDate) : undefined,
                    pickupDate: updateContractDto.pickupDate ? new Date(updateContractDto.pickupDate) : undefined,
                    returnDate: updateContractDto.returnDate ? new Date(updateContractDto.returnDate) : undefined,
                    needsAdjustment: updateContractDto.needsAdjustment,
                    observations: updateContractDto.observations,
                };
                Object.keys(contractData).forEach((key) => contractData[key] === undefined && delete contractData[key]);
                let updatedContract = await tx.contract.update({
                    where: { id },
                    data: contractData,
                });
                if (updateContractDto.items && updateContractDto.items.length > 0) {
                    const currentItems = await tx.contractItem.findMany({
                        where: { contractId: id },
                    });
                    await tx.contractItem.deleteMany({
                        where: { contractId: id },
                    });
                    for (const item of currentItems) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { status: 'AVAILABLE' },
                        });
                    }
                    const productIds = updateContractDto.items.map((item) => item.productId);
                    const products = await tx.product.findMany({
                        where: { id: { in: productIds } },
                    });
                    if (products.length !== productIds.length) {
                        throw new common_1.NotFoundException('Um ou mais produtos não foram encontrados');
                    }
                    for (const item of updateContractDto.items) {
                        await tx.contractItem.create({
                            data: {
                                contractId: id,
                                productId: item.productId,
                                quantity: item.quantity,
                                unitValue: item.unitValue,
                            },
                        });
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { status: 'RENTED' },
                        });
                    }
                }
                if (updateContractDto.payments && updateContractDto.payments.length > 0) {
                    await tx.payment.deleteMany({
                        where: { contractId: id },
                    });
                    for (const payment of updateContractDto.payments) {
                        await tx.payment.create({
                            data: {
                                contractId: id,
                                method: payment.method,
                                totalValue: payment.totalValue,
                                discountType: payment.discountType,
                                discountValue: payment.discountValue,
                                finalValue: payment.finalValue,
                                notes: payment.notes,
                            },
                        });
                    }
                }
                updatedContract = await tx.contract.findUnique({
                    where: { id },
                    include: {
                        client: true,
                        event: true,
                        location: true,
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        payments: true,
                    },
                });
                return updatedContract;
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Recurso não encontrado');
            }
            throw error;
        }
    }
    async remove(id) {
        const contract = await this.findOne(id);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const contractItems = await tx.contractItem.findMany({
                    where: { contractId: id },
                });
                for (const item of contractItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { status: 'AVAILABLE' },
                    });
                }
                await tx.contract.delete({
                    where: { id },
                });
                return { message: 'Contrato excluído com sucesso' };
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Contrato com ID ${id} não encontrado`);
            }
            throw error;
        }
    }
    async generateContractsPdf() {
        const contracts = await this.prisma.contract.findMany({
            include: {
                client: true,
                event: true,
                items: {
                    include: {
                        product: true
                    }
                },
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const fileName = `contratos_${Date.now()}.pdf`;
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.fontSize(20).text('Lista de Contratos', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        const statusCounts = {
            ACTIVE: contracts.filter(c => c.status === 'ACTIVE').length,
            CANCELED: contracts.filter(c => c.status === 'CANCELED').length,
            IN_PROGRESS: contracts.filter(c => c.status === 'IN_PROGRESS').length,
            COMPLETED: contracts.filter(c => c.status === 'COMPLETED').length,
        };
        doc.fontSize(12).font('Helvetica-Bold').text('Resumo por Status:');
        doc.moveDown(0.5);
        doc.font('Helvetica');
        doc.text(`Ativos: ${statusCounts.ACTIVE}`);
        doc.text(`Cancelados: ${statusCounts.CANCELED}`);
        doc.text(`Em Andamento: ${statusCounts.IN_PROGRESS}`);
        doc.text(`Concluídos: ${statusCounts.COMPLETED}`);
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold');
        const colPositions = [50, 150, 280, 360, 440, 520];
        doc.text('ID', colPositions[0], 200);
        doc.text('Cliente', colPositions[1], 200);
        doc.text('Status', colPositions[2], 200);
        doc.text('Retirada', colPositions[3], 200);
        doc.text('Devolução', colPositions[4], 200);
        doc.text('Total', colPositions[5], 200);
        doc.moveTo(50, 220).lineTo(570, 220).stroke();
        doc.font('Helvetica');
        let yPosition = 230;
        const translateStatus = (status) => {
            const statusMap = {
                ACTIVE: 'Ativo',
                CANCELED: 'Cancelado',
                IN_PROGRESS: 'Em Andamento',
                COMPLETED: 'Concluído',
            };
            return statusMap[status] || status;
        };
        for (const contract of contracts) {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('ID', 50, yPosition);
                doc.text('Cliente', 100, yPosition);
                doc.text('Status', 250, yPosition);
                doc.text('Retirada', 320, yPosition);
                doc.text('Devolução', 400, yPosition);
                doc.text('Total', 480, yPosition);
                doc.moveTo(50, yPosition + 20).lineTo(550, yPosition + 20).stroke();
                doc.font('Helvetica');
                yPosition += 30;
            }
            const totalValue = contract.payments.reduce((sum, payment) => sum + payment.finalValue, 0);
            const shortId = contract.id.substring(0, 6);
            const formatDate = (date) => {
                return date.toLocaleDateString('pt-BR');
            };
            doc.text(shortId, colPositions[0], yPosition);
            doc.text(contract.client.name.substring(0, 20), colPositions[1], yPosition);
            doc.text(translateStatus(contract.status), colPositions[2], yPosition);
            doc.text(formatDate(contract.pickupDate), colPositions[3], yPosition);
            doc.text(formatDate(contract.returnDate), colPositions[4], yPosition);
            doc.text(`R$ ${totalValue.toFixed(2)}`, colPositions[5], yPosition);
            yPosition += 30;
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
    async generateContractPdf(id) {
        const contract = await this.findOne(id);
        const fileName = `contrato_${contract.id}_${Date.now()}.pdf`;
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.fontSize(20).text('CONTRATO DE ALUGUEL', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Contrato Nº: ${contract.id}`, { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        const translateStatus = (status) => {
            const statusMap = {
                ACTIVE: 'Ativo',
                CANCELED: 'Cancelado',
                IN_PROGRESS: 'Em Andamento',
                COMPLETED: 'Concluído',
            };
            return statusMap[status] || status;
        };
        const formatDate = (date) => {
            return date.toLocaleDateString('pt-BR');
        };
        doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO CLIENTE:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Nome: ${contract.client.name}`);
        doc.text(`CPF/CNPJ: ${contract.client.cpfCnpj}`);
        doc.text(`Email: ${contract.client.email}`);
        doc.text(`Telefone: ${contract.client.phone}`);
        if (contract.client.address) {
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica-Bold').text('Endereço:');
            doc.fontSize(12).font('Helvetica');
            const { address } = contract.client;
            doc.text(`${address.street.name}, ${address.number}${address.complement ? `, ${address.complement}` : ''}`);
            doc.text(`${address.city.name} - ${address.city.state.uf}, CEP: ${address.zipCode}`);
        }
        doc.moveDown(1.5);
        if (contract.event) {
            doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO EVENTO:');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(`Nome do Evento: ${contract.event.name}`);
            if (contract.event.date) {
                doc.text(`Data: ${contract.event.date}`);
            }
            if (contract.event.time) {
                doc.text(`Hora: ${contract.event.time}`);
            }
            doc.moveDown(1.5);
        }
        if (contract.location) {
            doc.fontSize(14).font('Helvetica-Bold').text('LOCAL:');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(`Nome do Local: ${contract.location.name}`);
            if (contract.location.addressId) {
                const locationAddress = await this.prisma.address.findUnique({
                    where: { id: contract.location.addressId },
                    include: {
                        street: true,
                        city: {
                            include: {
                                state: true,
                            },
                        },
                    },
                });
                if (locationAddress) {
                    doc.text(`Endereço: ${locationAddress.street.name}, ${locationAddress.number}${locationAddress.complement ? `, ${locationAddress.complement}` : ''}`);
                    doc.text(`${locationAddress.city.name} - ${locationAddress.city.state.uf}, CEP: ${locationAddress.zipCode}`);
                }
            }
            doc.moveDown(1.5);
        }
        doc.fontSize(14).font('Helvetica-Bold').text('DATAS:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        if (contract.fittingDate) {
            doc.text(`Data da Prova: ${formatDate(contract.fittingDate)}`);
        }
        doc.text(`Data de Retirada: ${formatDate(contract.pickupDate)}`);
        doc.text(`Data de Devolução: ${formatDate(contract.returnDate)}`);
        doc.text(`Necessita de Ajustes: ${contract.needsAdjustment ? 'Sim' : 'Não'}`);
        doc.moveDown(1.5);
        doc.fontSize(14).font('Helvetica-Bold').text(`STATUS: ${translateStatus(contract.status)}`);
        doc.moveDown(1.5);
        doc.fontSize(14).font('Helvetica-Bold').text('ITENS:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Produto', 50, doc.y);
        doc.text('Código', 200, doc.y - 12);
        doc.text('Qtd', 280, doc.y - 12);
        doc.text('Valor Unit.', 320, doc.y - 12);
        doc.text('Total', 400, doc.y - 12);
        const itemsHeaderY = doc.y;
        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.font('Helvetica');
        let itemsTotal = 0;
        for (const item of contract.items) {
            if (doc.y > 700) {
                doc.addPage();
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Produto', 50, 50);
                doc.text('Código', 200, 50);
                doc.text('Qtd', 280, 50);
                doc.text('Valor Unit.', 320, 50);
                doc.text('Total', 400, 50);
                doc.moveTo(50, 70).lineTo(550, 70).stroke();
                doc.font('Helvetica');
                doc.y = 80;
            }
            const lineItemTotal = item.quantity * item.unitValue;
            itemsTotal += lineItemTotal;
            const startY = doc.y + 10;
            doc.text(item.product.name, 50, startY);
            doc.text(item.product.code, 200, startY);
            doc.text(item.quantity.toString(), 280, startY);
            doc.text(`R$ ${item.unitValue.toFixed(2)}`, 320, startY);
            doc.text(`R$ ${lineItemTotal.toFixed(2)}`, 400, startY);
            doc.y = startY + 15;
        }
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total de Itens: R$ ${itemsTotal.toFixed(2)}`, { align: 'right' });
        doc.moveDown(1.5);
        doc.fontSize(14).font('Helvetica-Bold').text('PAGAMENTOS:');
        doc.moveDown(0.5);
        const translatePaymentMethod = (method) => {
            const methodMap = {
                PIX: 'PIX',
                CREDIT_CARD: 'Cartão de Crédito',
                DEBIT_CARD: 'Cartão de Débito',
                CASH: 'Dinheiro',
            };
            return methodMap[method] || method;
        };
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Método', 50, doc.y);
        doc.text('Valor Total', 180, doc.y - 12);
        doc.text('Desconto', 280, doc.y - 12);
        doc.text('Valor Final', 400, doc.y - 12);
        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.font('Helvetica');
        let paymentsTotal = 0;
        for (const payment of contract.payments) {
            if (doc.y > 700) {
                doc.addPage();
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Método', 50, 50);
                doc.text('Valor Total', 180, 50);
                doc.text('Desconto', 280, 50);
                doc.text('Valor Final', 400, 50);
                doc.moveTo(50, 70).lineTo(550, 70).stroke();
                doc.font('Helvetica');
                doc.y = 80;
            }
            paymentsTotal += payment.finalValue;
            const startY = doc.y + 10;
            doc.text(translatePaymentMethod(payment.method), 50, startY);
            doc.text(`R$ ${payment.totalValue.toFixed(2)}`, 180, startY);
            let discountText = 'Nenhum';
            if (payment.discountType && payment.discountValue) {
                if (payment.discountType === 'PERCENTAGE') {
                    discountText = `${payment.discountValue}%`;
                }
                else {
                    discountText = `R$ ${payment.discountValue.toFixed(2)}`;
                }
            }
            doc.text(discountText, 280, startY);
            doc.text(`R$ ${payment.finalValue.toFixed(2)}`, 400, startY);
            doc.y = startY + 15;
        }
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total de Pagamentos: R$ ${paymentsTotal.toFixed(2)}`, { align: 'right' });
        doc.moveDown(1.5);
        if (contract.observations) {
            doc.fontSize(14).font('Helvetica-Bold').text('OBSERVAÇÕES:');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(contract.observations);
            doc.moveDown(1.5);
        }
        doc.y = Math.max(doc.y, 650);
        doc.fontSize(12).font('Helvetica');
        doc.text('_________________________________', { align: 'left', width: 200 });
        doc.text('Assinatura do Cliente', { align: 'left', width: 200 });
        doc.moveUp(2);
        doc.text('_________________________________', { align: 'right', width: 200 });
        doc.text('Assinatura da Empresa', { align: 'right', width: 200 });
        doc.end();
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
                resolve(fileUrl);
            });
            writeStream.on('error', reject);
        });
    }
    async processContractTemplate(id, templateBuffer) {
        const contract = await this.findOne(id);
        const result = await mammoth.convertToHtml({ buffer: templateBuffer });
        let htmlContent = result.value;
        htmlContent = htmlContent.replace(/\{\{cliente\.nome\}\}/g, contract.client.name || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.cpf_cnpj\}\}/g, contract.client.cpfCnpj || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.email\}\}/g, contract.client.email || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.telefone\}\}/g, contract.client.phone || '');
        if (contract.client.address) {
            const address = contract.client.address;
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.rua\}\}/g, address.street.name || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.numero\}\}/g, address.number || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.complemento\}\}/g, address.complement || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.cep\}\}/g, address.zipCode || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.cidade\}\}/g, address.city.name || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.estado\}\}/g, address.city.state.name || '');
            htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.uf\}\}/g, address.city.state.uf || '');
        }
        htmlContent = htmlContent.replace(/\{\{contrato\.id\}\}/g, contract.id || '');
        htmlContent = htmlContent.replace(/\{\{contrato\.data_criacao\}\}/g, contract.createdAt.toLocaleDateString('pt-BR') || '');
        if (contract.fittingDate) {
            htmlContent = htmlContent.replace(/\{\{contrato\.data_prova\}\}/g, contract.fittingDate.toLocaleDateString('pt-BR') || '');
        }
        htmlContent = htmlContent.replace(/\{\{contrato\.data_retirada\}\}/g, contract.pickupDate.toLocaleDateString('pt-BR') || '');
        htmlContent = htmlContent.replace(/\{\{contrato\.data_devolucao\}\}/g, contract.returnDate.toLocaleDateString('pt-BR') || '');
        htmlContent = htmlContent.replace(/\{\{contrato\.necessita_ajustes\}\}/g, contract.needsAdjustment ? 'Sim' : 'Não');
        const statusMap = {
            ACTIVE: 'Ativo',
            CANCELED: 'Cancelado',
            IN_PROGRESS: 'Em Andamento',
            COMPLETED: 'Concluído',
        };
        htmlContent = htmlContent.replace(/\{\{contrato\.status\}\}/g, statusMap[contract.status] || contract.status);
        if (contract.event) {
            htmlContent = htmlContent.replace(/\{\{evento\.nome\}\}/g, contract.event.name || '');
            htmlContent = htmlContent.replace(/\{\{evento\.data\}\}/g, contract.event.date || '');
            htmlContent = htmlContent.replace(/\{\{evento\.hora\}\}/g, contract.event.time || '');
        }
        if (contract.location) {
            htmlContent = htmlContent.replace(/\{\{local\.nome\}\}/g, contract.location.name || '');
            if (contract.location.addressId) {
                const locationAddress = await this.prisma.address.findUnique({
                    where: { id: contract.location.addressId },
                    include: {
                        street: true,
                        city: {
                            include: {
                                state: true,
                            },
                        },
                    },
                });
                if (locationAddress) {
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.rua\}\}/g, locationAddress.street.name || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.numero\}\}/g, locationAddress.number || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.complemento\}\}/g, locationAddress.complement || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.cep\}\}/g, locationAddress.zipCode || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.cidade\}\}/g, locationAddress.city.name || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.estado\}\}/g, locationAddress.city.state.name || '');
                    htmlContent = htmlContent.replace(/\{\{local\.endereco\.uf\}\}/g, locationAddress.city.state.uf || '');
                }
            }
        }
        htmlContent = htmlContent.replace(/\{\{contrato\.observacoes\}\}/g, contract.observations || '');
        let itemsTable = '<table border="1" cellpadding="5" style="width:100%"><tr><th>Produto</th><th>Código</th><th>Quantidade</th><th>Valor Unitário</th><th>Total</th></tr>';
        let itemsTotal = 0;
        for (const item of contract.items) {
            const itemTotal = item.quantity * item.unitValue;
            itemsTotal += itemTotal;
            itemsTable += `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.product.code}</td>
            <td>${item.quantity}</td>
            <td>R$ ${item.unitValue.toFixed(2)}</td>
            <td>R$ ${itemTotal.toFixed(2)}</td>
          </tr>
        `;
        }
        itemsTable += `
        <tr>
          <td colspan="4" align="right"><strong>Total:</strong></td>
          <td><strong>R$ ${itemsTotal.toFixed(2)}</strong></td>
        </tr>
      </table>`;
        htmlContent = htmlContent.replace(/\{\{contrato\.itens\}\}/g, itemsTable);
        let paymentsTable = '<table border="1" cellpadding="5" style="width:100%"><tr><th>Método</th><th>Valor Total</th><th>Desconto</th><th>Valor Final</th></tr>';
        let paymentsTotal = 0;
        const methodMap = {
            PIX: 'PIX',
            CREDIT_CARD: 'Cartão de Crédito',
            DEBIT_CARD: 'Cartão de Débito',
            CASH: 'Dinheiro',
        };
        for (const payment of contract.payments) {
            paymentsTotal += payment.finalValue;
            let discountText = 'Nenhum';
            if (payment.discountType && payment.discountValue) {
                if (payment.discountType === 'PERCENTAGE') {
                    discountText = `${payment.discountValue}%`;
                }
                else {
                    discountText = `R$ ${payment.discountValue.toFixed(2)}`;
                }
            }
            paymentsTable += `
          <tr>
            <td>${methodMap[payment.method] || payment.method}</td>
            <td>R$ ${payment.totalValue.toFixed(2)}</td>
            <td>${discountText}</td>
            <td>R$ ${payment.finalValue.toFixed(2)}</td>
          </tr>
        `;
        }
        paymentsTable += `
        <tr>
          <td colspan="3" align="right"><strong>Total:</strong></td>
          <td><strong>R$ ${paymentsTotal.toFixed(2)}</strong></td>
        </tr>
      </table>`;
        htmlContent = htmlContent.replace(/\{\{contrato\.pagamentos\}\}/g, paymentsTable);
        const fileName = `contrato_${contract.id}_modelo_${Date.now()}.pdf`;
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        const textContent = htmlContent
            .replace(/<table[^>]*>/g, '\n\n')
            .replace(/<\/table>/g, '\n\n')
            .replace(/<tr[^>]*>/g, '')
            .replace(/<\/tr>/g, '\n')
            .replace(/<td[^>]*>/g, ' ')
            .replace(/<\/td>/g, ' | ')
            .replace(/<th[^>]*>/g, ' ')
            .replace(/<\/th>/g, ' | ')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\|\s*\|/g, '|')
            .replace(/\|\s*\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n');
        doc.fontSize(12).text(textContent, {
            paragraphGap: 10,
            lineGap: 5,
            align: 'justify',
        });
        doc.end();
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
                resolve(fileUrl);
            });
            writeStream.on('error', reject);
        });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contract.service.js.map