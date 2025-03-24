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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClientDto) {
        const existingClient = await this.prisma.client.findFirst({
            where: {
                OR: [
                    { email: createClientDto.email },
                    { cpfCnpj: createClientDto.cpfCnpj },
                    { phone: createClientDto.phone },
                ],
            },
        });
        if (existingClient) {
            throw new common_1.ConflictException('E-mail, CPF/CNPJ ou telefone já cadastrado');
        }
        const state = await this.prisma.state.upsert({
            where: { name: createClientDto.state },
            update: {},
            create: {
                name: createClientDto.state,
                uf: createClientDto.state.substring(0, 2).toUpperCase(),
            },
        });
        const city = await this.prisma.city.upsert({
            where: {
                name_stateId: {
                    name: createClientDto.city,
                    stateId: state.id,
                },
            },
            update: {},
            create: {
                name: createClientDto.city,
                stateId: state.id,
            },
        });
        const street = await this.prisma.street.upsert({
            where: { name: createClientDto.street },
            update: {},
            create: {
                name: createClientDto.street,
            },
        });
        const address = await this.prisma.address.create({
            data: {
                number: createClientDto.number,
                complement: createClientDto.complement,
                zipCode: createClientDto.zipCode,
                streetId: street.id,
                cityId: city.id,
            },
        });
        const measurements = await this.prisma.measurements.create({
            data: {
                shoulder: createClientDto.shoulder,
                bust: createClientDto.bust,
                shoulderToWaistLength: createClientDto.shoulderToWaistLength,
                shoulderToCosLength: createClientDto.shoulderToCosLength,
                tqcLength: createClientDto.tqcLength,
                waist: createClientDto.waist,
                cos: createClientDto.cos,
                hip: createClientDto.hip,
                shortSkirtLength: createClientDto.shortSkirtLength,
                longSkirtLength: createClientDto.longSkirtLength,
                shortLength: createClientDto.shortLength,
                pantsLength: createClientDto.pantsLength,
                dressLength: createClientDto.dressLength,
                sleeveLength: createClientDto.sleeveLength,
                wrist: createClientDto.wrist,
                frontMeasure: createClientDto.frontMeasure,
                shoulderToShoulderWidth: createClientDto.shoulderToShoulderWidth,
            },
        });
        const client = await this.prisma.client.create({
            data: {
                name: createClientDto.name,
                email: createClientDto.email,
                phone: createClientDto.phone,
                cpfCnpj: createClientDto.cpfCnpj,
                instagram: createClientDto.instagram,
                imageUrl: createClientDto.imageUrl,
                addressId: address.id,
                measurementsId: measurements.id,
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
                measurements: true,
            },
        });
        return client;
    }
    async findAll() {
        return this.prisma.client.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpfCnpj: true,
                instagram: true,
                imageUrl: true,
                createdAt: true,
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
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
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
        });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        return client;
    }
    async update(id, updateClientDto) {
        const existingClient = await this.prisma.client.findUnique({
            where: { id },
            include: {
                address: true,
                measurements: true,
            },
        });
        if (!existingClient) {
            throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        if (updateClientDto.email ||
            updateClientDto.cpfCnpj ||
            updateClientDto.phone) {
            const conflict = await this.prisma.client.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        updateClientDto.email ? { email: updateClientDto.email } : {},
                        updateClientDto.cpfCnpj ? { cpfCnpj: updateClientDto.cpfCnpj } : {},
                        updateClientDto.phone ? { phone: updateClientDto.phone } : {},
                    ],
                },
            });
            if (conflict) {
                throw new common_1.ConflictException('E-mail, CPF/CNPJ ou telefone já cadastrado por outro cliente');
            }
        }
        if (updateClientDto.street ||
            updateClientDto.number ||
            updateClientDto.complement ||
            updateClientDto.zipCode ||
            updateClientDto.city ||
            updateClientDto.state) {
            if (existingClient.address) {
                let streetId = existingClient.address.streetId;
                if (updateClientDto.street) {
                    const street = await this.prisma.street.upsert({
                        where: { name: updateClientDto.street },
                        update: {},
                        create: { name: updateClientDto.street },
                    });
                    streetId = street.id;
                }
                let cityId = existingClient.address.cityId;
                if (updateClientDto.city || updateClientDto.state) {
                    const currentCity = await this.prisma.city.findUnique({
                        where: { id: existingClient.address.cityId },
                        include: { state: true },
                    });
                    if (!currentCity) {
                        throw new common_1.NotFoundException(`Cidade com ID ${existingClient.address.cityId} não encontrada`);
                    }
                    const stateName = updateClientDto.state || currentCity.state.name;
                    const state = await this.prisma.state.upsert({
                        where: { name: stateName },
                        update: {},
                        create: {
                            name: stateName,
                            uf: stateName.substring(0, 2).toUpperCase(),
                        },
                    });
                    const cityName = updateClientDto.city || currentCity.name;
                    const city = await this.prisma.city.upsert({
                        where: {
                            name_stateId: {
                                name: cityName,
                                stateId: state.id,
                            },
                        },
                        update: {},
                        create: {
                            name: cityName,
                            stateId: state.id,
                        },
                    });
                    cityId = city.id;
                }
                await this.prisma.address.update({
                    where: { id: existingClient.address.id },
                    data: {
                        streetId,
                        cityId,
                        number: updateClientDto.number || existingClient.address.number,
                        complement: updateClientDto.complement !== undefined
                            ? updateClientDto.complement
                            : existingClient.address.complement,
                        zipCode: updateClientDto.zipCode || existingClient.address.zipCode,
                    },
                });
            }
            else {
                if (!updateClientDto.street ||
                    !updateClientDto.number ||
                    !updateClientDto.zipCode ||
                    !updateClientDto.city ||
                    !updateClientDto.state) {
                    throw new common_1.BadRequestException('Para criar um novo endereço, todos os campos são obrigatórios (street, number, zipCode, city, state)');
                }
                const state = await this.prisma.state.upsert({
                    where: { name: updateClientDto.state },
                    update: {},
                    create: {
                        name: updateClientDto.state,
                        uf: updateClientDto.state.substring(0, 2).toUpperCase(),
                    },
                });
                const city = await this.prisma.city.upsert({
                    where: {
                        name_stateId: {
                            name: updateClientDto.city,
                            stateId: state.id,
                        },
                    },
                    update: {},
                    create: {
                        name: updateClientDto.city,
                        stateId: state.id,
                    },
                });
                const street = await this.prisma.street.upsert({
                    where: { name: updateClientDto.street },
                    update: {},
                    create: { name: updateClientDto.street },
                });
                const address = await this.prisma.address.create({
                    data: {
                        streetId: street.id,
                        cityId: city.id,
                        number: updateClientDto.number,
                        complement: updateClientDto.complement,
                        zipCode: updateClientDto.zipCode,
                    },
                });
                await this.prisma.client.update({
                    where: { id },
                    data: { addressId: address.id },
                });
            }
        }
        if (existingClient.measurements) {
            const measurementsUpdate = {};
            if (updateClientDto.shoulder !== undefined)
                measurementsUpdate['shoulder'] = updateClientDto.shoulder;
            if (updateClientDto.bust !== undefined)
                measurementsUpdate['bust'] = updateClientDto.bust;
            if (updateClientDto.shoulderToWaistLength !== undefined)
                measurementsUpdate['shoulderToWaistLength'] =
                    updateClientDto.shoulderToWaistLength;
            if (updateClientDto.shoulderToCosLength !== undefined)
                measurementsUpdate['shoulderToCosLength'] =
                    updateClientDto.shoulderToCosLength;
            if (updateClientDto.tqcLength !== undefined)
                measurementsUpdate['tqcLength'] = updateClientDto.tqcLength;
            if (updateClientDto.waist !== undefined)
                measurementsUpdate['waist'] = updateClientDto.waist;
            if (updateClientDto.cos !== undefined)
                measurementsUpdate['cos'] = updateClientDto.cos;
            if (updateClientDto.hip !== undefined)
                measurementsUpdate['hip'] = updateClientDto.hip;
            if (updateClientDto.shortSkirtLength !== undefined)
                measurementsUpdate['shortSkirtLength'] =
                    updateClientDto.shortSkirtLength;
            if (updateClientDto.longSkirtLength !== undefined)
                measurementsUpdate['longSkirtLength'] = updateClientDto.longSkirtLength;
            if (updateClientDto.shortLength !== undefined)
                measurementsUpdate['shortLength'] = updateClientDto.shortLength;
            if (updateClientDto.pantsLength !== undefined)
                measurementsUpdate['pantsLength'] = updateClientDto.pantsLength;
            if (updateClientDto.dressLength !== undefined)
                measurementsUpdate['dressLength'] = updateClientDto.dressLength;
            if (updateClientDto.sleeveLength !== undefined)
                measurementsUpdate['sleeveLength'] = updateClientDto.sleeveLength;
            if (updateClientDto.wrist !== undefined)
                measurementsUpdate['wrist'] = updateClientDto.wrist;
            if (updateClientDto.frontMeasure !== undefined)
                measurementsUpdate['frontMeasure'] = updateClientDto.frontMeasure;
            if (updateClientDto.shoulderToShoulderWidth !== undefined)
                measurementsUpdate['shoulderToShoulderWidth'] =
                    updateClientDto.shoulderToShoulderWidth;
            if (Object.keys(measurementsUpdate).length > 0) {
                await this.prisma.measurements.update({
                    where: { id: existingClient.measurementsId },
                    data: measurementsUpdate,
                });
            }
        }
        else if (updateClientDto.shoulder !== undefined ||
            updateClientDto.bust !== undefined ||
            updateClientDto.shoulderToWaistLength !== undefined ||
            updateClientDto.shoulderToCosLength !== undefined ||
            updateClientDto.tqcLength !== undefined ||
            updateClientDto.waist !== undefined ||
            updateClientDto.cos !== undefined ||
            updateClientDto.hip !== undefined ||
            updateClientDto.shortSkirtLength !== undefined ||
            updateClientDto.longSkirtLength !== undefined ||
            updateClientDto.shortLength !== undefined ||
            updateClientDto.pantsLength !== undefined ||
            updateClientDto.dressLength !== undefined ||
            updateClientDto.sleeveLength !== undefined ||
            updateClientDto.wrist !== undefined ||
            updateClientDto.frontMeasure !== undefined ||
            updateClientDto.shoulderToShoulderWidth !== undefined) {
            const measurements = await this.prisma.measurements.create({
                data: {
                    shoulder: updateClientDto.shoulder,
                    bust: updateClientDto.bust,
                    shoulderToWaistLength: updateClientDto.shoulderToWaistLength,
                    shoulderToCosLength: updateClientDto.shoulderToCosLength,
                    tqcLength: updateClientDto.tqcLength,
                    waist: updateClientDto.waist,
                    cos: updateClientDto.cos,
                    hip: updateClientDto.hip,
                    shortSkirtLength: updateClientDto.shortSkirtLength,
                    longSkirtLength: updateClientDto.longSkirtLength,
                    shortLength: updateClientDto.shortLength,
                    pantsLength: updateClientDto.pantsLength,
                    dressLength: updateClientDto.dressLength,
                    sleeveLength: updateClientDto.sleeveLength,
                    wrist: updateClientDto.wrist,
                    frontMeasure: updateClientDto.frontMeasure,
                    shoulderToShoulderWidth: updateClientDto.shoulderToShoulderWidth,
                },
            });
            await this.prisma.client.update({
                where: { id },
                data: { measurementsId: measurements.id },
            });
        }
        const clientUpdate = {};
        if (updateClientDto.name !== undefined)
            clientUpdate['name'] = updateClientDto.name;
        if (updateClientDto.email !== undefined)
            clientUpdate['email'] = updateClientDto.email;
        if (updateClientDto.phone !== undefined)
            clientUpdate['phone'] = updateClientDto.phone;
        if (updateClientDto.cpfCnpj !== undefined)
            clientUpdate['cpfCnpj'] = updateClientDto.cpfCnpj;
        if (updateClientDto.instagram !== undefined)
            clientUpdate['instagram'] = updateClientDto.instagram;
        if (updateClientDto.imageUrl !== undefined)
            clientUpdate['imageUrl'] = updateClientDto.imageUrl;
        if (Object.keys(clientUpdate).length > 0) {
            await this.prisma.client.update({
                where: { id },
                data: clientUpdate,
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                measurements: true,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        if (client.measurementsId) {
            await this.prisma.measurements.delete({
                where: { id: client.measurementsId },
            });
        }
        await this.prisma.client.delete({
            where: { id },
        });
        return { message: 'Cliente excluído com sucesso' };
    }
    async uploadImage(id, imageUrl) {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        return this.prisma.client.update({
            where: { id },
            data: { imageUrl },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map