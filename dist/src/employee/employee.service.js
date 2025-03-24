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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");
const client_1 = require("@prisma/client");
let EmployeesService = class EmployeesService {
    prisma;
    uploadService;
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
    }
    async create(createEmployeeDto) {
        const existingEmployee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { email: createEmployeeDto.email },
                    { cpf: createEmployeeDto.cpf },
                    { phone: createEmployeeDto.phone },
                ],
            },
        });
        if (existingEmployee) {
            throw new common_1.ConflictException('E-mail, CPF ou telefone já cadastrado');
        }
        const state = await this.prisma.state.upsert({
            where: { name: createEmployeeDto.state },
            update: {},
            create: {
                name: createEmployeeDto.state,
                uf: createEmployeeDto.state.substring(0, 2).toUpperCase(),
            },
        });
        const city = await this.prisma.city.upsert({
            where: {
                name_stateId: {
                    name: createEmployeeDto.city,
                    stateId: state.id,
                },
            },
            update: {},
            create: {
                name: createEmployeeDto.city,
                stateId: state.id,
            },
        });
        const street = await this.prisma.street.upsert({
            where: { name: createEmployeeDto.street },
            update: {},
            create: {
                name: createEmployeeDto.street,
            },
        });
        const address = await this.prisma.address.create({
            data: {
                number: createEmployeeDto.number,
                complement: createEmployeeDto.complement,
                zipCode: createEmployeeDto.zipCode,
                streetId: street.id,
                cityId: city.id,
            },
        });
        const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
        const employee = await this.prisma.employee.create({
            data: {
                name: createEmployeeDto.name,
                email: createEmployeeDto.email,
                cpf: createEmployeeDto.cpf,
                password: hashedPassword,
                salary: createEmployeeDto.salary,
                phone: createEmployeeDto.phone,
                birthday: createEmployeeDto.birthday || null,
                workHours: createEmployeeDto.workHours,
                role: createEmployeeDto.role || 'USER',
                imageUrl: createEmployeeDto.imageUrl,
                addressId: address.id,
            },
            include: {
                address: {
                    include: {
                        city: {
                            include: {
                                state: true,
                            },
                        },
                        street: true,
                    },
                },
            },
        });
        const { password, ...result } = employee;
        return result;
    }
    async findAll(options = {}) {
        const { search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { email: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { cpf: { contains: search } },
                    { phone: { contains: search } },
                ],
            }
            : {};
        const employees = await this.prisma.employee.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                salary: true,
                phone: true,
                birthday: true,
                workHours: true,
                role: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
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
            },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        });
        const total = await this.prisma.employee.count({ where });
        return employees;
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                salary: true,
                phone: true,
                birthday: true,
                workHours: true,
                role: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
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
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Funcionário com ID ${id} não encontrado`);
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        const existingEmployee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                address: true,
            },
        });
        if (!existingEmployee) {
            throw new common_1.NotFoundException(`Funcionário com ID ${id} não encontrado`);
        }
        const whereConditions = [];
        if (updateEmployeeDto.email) {
            whereConditions.push({ email: updateEmployeeDto.email });
        }
        if (updateEmployeeDto.cpf) {
            whereConditions.push({ cpf: updateEmployeeDto.cpf });
        }
        if (updateEmployeeDto.phone) {
            whereConditions.push({ phone: updateEmployeeDto.phone });
        }
        if (whereConditions.length > 0) {
            const conflict = await this.prisma.employee.findFirst({
                where: {
                    OR: whereConditions,
                    NOT: {
                        id,
                    },
                },
            });
            if (conflict) {
                throw new common_1.ConflictException('E-mail, CPF ou telefone já utilizado por outro funcionário');
            }
        }
        if (updateEmployeeDto.street ||
            updateEmployeeDto.number ||
            updateEmployeeDto.complement ||
            updateEmployeeDto.zipCode ||
            updateEmployeeDto.city ||
            updateEmployeeDto.state) {
            let streetId = existingEmployee.address?.streetId;
            let cityId = existingEmployee.address?.cityId;
            if (updateEmployeeDto.street) {
                const street = await this.prisma.street.upsert({
                    where: { name: updateEmployeeDto.street },
                    update: {},
                    create: {
                        name: updateEmployeeDto.street,
                    },
                });
                streetId = street.id;
            }
            if (updateEmployeeDto.city || updateEmployeeDto.state) {
                if (updateEmployeeDto.city &&
                    !updateEmployeeDto.state &&
                    existingEmployee.address) {
                    const currentCity = await this.prisma.city.findUnique({
                        where: { id: existingEmployee.address.cityId },
                        include: { state: true },
                    });
                    if (currentCity && currentCity.state) {
                        const state = await this.prisma.state.findUnique({
                            where: { id: currentCity.stateId },
                        });
                        if (state) {
                            const city = await this.prisma.city.upsert({
                                where: {
                                    name_stateId: {
                                        name: updateEmployeeDto.city,
                                        stateId: state.id,
                                    },
                                },
                                update: {},
                                create: {
                                    name: updateEmployeeDto.city,
                                    stateId: state.id,
                                },
                            });
                            cityId = city.id;
                        }
                    }
                }
                else if (updateEmployeeDto.city && updateEmployeeDto.state) {
                    const state = await this.prisma.state.upsert({
                        where: { name: updateEmployeeDto.state },
                        update: {},
                        create: {
                            name: updateEmployeeDto.state,
                            uf: updateEmployeeDto.state.substring(0, 2).toUpperCase(),
                        },
                    });
                    const city = await this.prisma.city.upsert({
                        where: {
                            name_stateId: {
                                name: updateEmployeeDto.city,
                                stateId: state.id,
                            },
                        },
                        update: {},
                        create: {
                            name: updateEmployeeDto.city,
                            stateId: state.id,
                        },
                    });
                    cityId = city.id;
                }
            }
            if (existingEmployee.addressId && existingEmployee.address) {
                await this.prisma.address.update({
                    where: { id: existingEmployee.addressId },
                    data: {
                        number: updateEmployeeDto.number ?? existingEmployee.address.number,
                        complement: updateEmployeeDto.complement ??
                            existingEmployee.address.complement,
                        zipCode: updateEmployeeDto.zipCode ?? existingEmployee.address.zipCode,
                        streetId: streetId ?? existingEmployee.address.streetId,
                        cityId: cityId ?? existingEmployee.address.cityId,
                    },
                });
            }
            else if (streetId && cityId) {
                const address = await this.prisma.address.create({
                    data: {
                        number: updateEmployeeDto.number,
                        complement: updateEmployeeDto.complement,
                        zipCode: updateEmployeeDto.zipCode,
                        streetId,
                        cityId,
                    },
                });
                await this.prisma.employee.update({
                    where: { id },
                    data: {
                        addressId: address.id,
                    },
                });
            }
        }
        const updatedEmployee = await this.prisma.employee.update({
            where: { id },
            data: {
                name: updateEmployeeDto.name,
                email: updateEmployeeDto.email,
                cpf: updateEmployeeDto.cpf,
                salary: updateEmployeeDto.salary,
                phone: updateEmployeeDto.phone,
                birthday: updateEmployeeDto.birthday,
                workHours: updateEmployeeDto.workHours,
                role: updateEmployeeDto.role,
                imageUrl: updateEmployeeDto.imageUrl,
            },
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
            },
        });
        const { password, ...result } = updatedEmployee;
        return result;
    }
    async remove(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                address: true,
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Funcionário com ID ${id} não encontrado`);
        }
        if (employee.imageUrl) {
            await this.uploadService.deleteFile(employee.imageUrl);
        }
        await this.prisma.employee.delete({
            where: { id },
        });
        if (employee.addressId) {
            await this.prisma.address.delete({
                where: { id: employee.addressId },
            });
        }
        return { message: 'Funcionário excluído com sucesso' };
    }
    async uploadProfileImage(id, imageBuffer, filename) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Funcionário com ID ${id} não encontrado`);
        }
        if (employee.imageUrl) {
            await this.uploadService.deleteFile(employee.imageUrl);
        }
        const imageUrl = await this.uploadService.uploadFile(imageBuffer, filename);
        await this.prisma.employee.update({
            where: { id },
            data: { imageUrl },
        });
        return imageUrl;
    }
    async generatePdf() {
        const employees = await this.prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                salary: true,
                phone: true,
                birthday: true,
                workHours: true,
                imageUrl: true,
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
            },
            orderBy: { name: 'asc' },
        });
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.fontSize(25).text('Lista de Funcionários', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        const tableTop = 150;
        const tableLeft = 50;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Nome', tableLeft, tableTop);
        doc.text('Email', tableLeft + 150, tableTop);
        doc.text('CPF', tableLeft + 300, tableTop);
        doc.text('Salário', tableLeft + 400, tableTop);
        doc
            .moveTo(tableLeft, tableTop + 20)
            .lineTo(tableLeft + 500, tableTop + 20)
            .stroke();
        let yPosition = tableTop + 30;
        doc.font('Helvetica');
        employees.forEach((employee, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Nome', tableLeft, yPosition);
                doc.text('Email', tableLeft + 150, yPosition);
                doc.text('CPF', tableLeft + 300, yPosition);
                doc.text('Salário', tableLeft + 400, yPosition);
                doc
                    .moveTo(tableLeft, yPosition + 20)
                    .lineTo(tableLeft + 500, yPosition + 20)
                    .stroke();
                yPosition += 30;
                doc.font('Helvetica');
            }
            const cpf = employee.cpf;
            const formattedCpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
            const formattedSalary = `R$ ${employee.salary.toFixed(2).replace('.', ',')}`;
            doc.text(employee.name, tableLeft, yPosition, { width: 140 });
            doc.text(employee.email, tableLeft + 150, yPosition, { width: 140 });
            doc.text(formattedCpf, tableLeft + 300, yPosition);
            doc.text(formattedSalary, tableLeft + 400, yPosition);
            if (index < employees.length - 1) {
                doc
                    .moveTo(tableLeft, yPosition + 20)
                    .lineTo(tableLeft + 500, yPosition + 20)
                    .stroke();
            }
            yPosition += 30;
        });
        doc.end();
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });
    }
    async generateEmployeePdf(id) {
        const employee = await this.findOne(id);
        if (!employee) {
            throw new common_1.NotFoundException(`Funcionário com ID ${id} não encontrado`);
        }
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc
            .fontSize(25)
            .text(`Ficha do Funcionário: ${employee.name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'right',
        });
        doc.moveDown(2);
        doc.fontSize(16).font('Helvetica-Bold').text('Informações Pessoais');
        doc.moveDown(0.5);
        doc.font('Helvetica');
        const cpf = employee.cpf;
        const formattedCpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
        const formattedSalary = `R$ ${employee.salary.toFixed(2).replace('.', ',')}`;
        const formatDate = (dateString) => {
            if (!dateString)
                return 'Não informado';
            return new Date(dateString).toLocaleDateString('pt-BR');
        };
        doc.fontSize(12);
        doc.text(`Nome: ${employee.name}`);
        doc.moveDown(0.5);
        doc.text(`Email: ${employee.email}`);
        doc.moveDown(0.5);
        doc.text(`CPF: ${formattedCpf}`);
        doc.moveDown(0.5);
        doc.text(`Telefone: ${employee.phone}`);
        doc.moveDown(0.5);
        doc.text(`Data de Nascimento: ${employee.birthday ? formatDate(employee.birthday) : 'Não informado'}`);
        doc.moveDown(0.5);
        doc.text(`Horário de Trabalho: ${employee.workHours}`);
        doc.moveDown(0.5);
        doc.text(`Salário: ${formattedSalary}`);
        doc.moveDown(0.5);
        doc.text(`Função: ${employee.role === 'ADMIN' ? 'Administrador' : 'Usuário'}`);
        doc.moveDown(0.5);
        doc
            .moveTo(50, doc.y + 20)
            .lineTo(550, doc.y + 20)
            .stroke();
        doc.moveDown(2);
        if (employee.address) {
            doc.fontSize(16).font('Helvetica-Bold').text('Endereço');
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12);
            doc.text(`Rua: ${employee.address.street.name}, ${employee.address.number}`);
            doc.moveDown(0.5);
            if (employee.address.complement) {
                doc.text(`Complemento: ${employee.address.complement}`);
                doc.moveDown(0.5);
            }
            doc.text(`CEP: ${employee.address.zipCode}`);
            doc.moveDown(0.5);
            doc.text(`Cidade: ${employee.address.city.name}`);
            doc.moveDown(0.5);
            doc.text(`Estado: ${employee.address.city.state.name} (${employee.address.city.state.uf})`);
        }
        doc.end();
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService])
], EmployeesService);
//# sourceMappingURL=employee.service.js.map