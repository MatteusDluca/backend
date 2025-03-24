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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationsService = class LocationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.location.findMany({
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
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.location.findUnique({
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
            },
        });
    }
    async create(data) {
        let addressId;
        if (data.street && data.city && data.state) {
            const state = await this.prisma.state.upsert({
                where: { name: data.state },
                update: {},
                create: {
                    name: data.state,
                    uf: data.state.substring(0, 2).toUpperCase(),
                },
            });
            const city = await this.prisma.city.upsert({
                where: {
                    name_stateId: {
                        name: data.city,
                        stateId: state.id,
                    },
                },
                update: {},
                create: {
                    name: data.city,
                    stateId: state.id,
                },
            });
            const street = await this.prisma.street.upsert({
                where: { name: data.street },
                update: {},
                create: { name: data.street },
            });
            const address = await this.prisma.address.create({
                data: {
                    streetId: street.id,
                    number: data.number || '',
                    complement: data.complement,
                    zipCode: data.zipCode || '',
                    cityId: city.id,
                },
            });
            addressId = address.id;
        }
        return this.prisma.location.create({
            data: {
                name: data.name,
                addressId,
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
    }
    async update(id, data) {
        const location = await this.prisma.location.findUnique({
            where: { id },
            include: { address: true },
        });
        let addressId = location?.addressId;
        if (data.street || data.city || data.state) {
            if (addressId) {
                const address = await this.prisma.address.findUnique({
                    where: { id: addressId },
                    include: { street: true, city: { include: { state: true } } },
                });
                if (data.state &&
                    address?.city?.state &&
                    data.state !== address.city.state.name) {
                    const state = await this.prisma.state.upsert({
                        where: { name: data.state },
                        update: {},
                        create: {
                            name: data.state,
                            uf: data.state.substring(0, 2).toUpperCase(),
                        },
                    });
                    const city = await this.prisma.city.upsert({
                        where: {
                            name_stateId: {
                                name: data.city || address?.city?.name,
                                stateId: state.id,
                            },
                        },
                        update: {},
                        create: {
                            name: data.city || address.city.name,
                            stateId: state.id,
                        },
                    });
                    await this.prisma.address.update({
                        where: { id: addressId },
                        data: { cityId: city.id },
                    });
                }
                if (data.city && address?.city && data.city !== address.city.name) {
                    const city = await this.prisma.city.upsert({
                        where: {
                            name_stateId: {
                                name: data.city,
                                stateId: address?.city?.state?.id,
                            },
                        },
                        update: {},
                        create: {
                            name: data.city,
                            stateId: address.city.state.id,
                        },
                    });
                    await this.prisma.address.update({
                        where: { id: addressId },
                        data: { cityId: city.id },
                    });
                }
                if (data.street &&
                    address?.street &&
                    data.street !== address.street.name) {
                    const street = await this.prisma.street.upsert({
                        where: { name: data.street },
                        update: {},
                        create: { name: data.street },
                    });
                    await this.prisma.address.update({
                        where: { id: addressId },
                        data: { streetId: street.id },
                    });
                }
                if (data.number || data.complement || data.zipCode) {
                    await this.prisma.address.update({
                        where: { id: addressId },
                        data: {
                            number: data.number !== undefined ? data.number : address?.number,
                            complement: data.complement !== undefined
                                ? data.complement
                                : address?.complement,
                            zipCode: data.zipCode !== undefined ? data.zipCode : address?.zipCode,
                        },
                    });
                }
            }
            else {
                if (data.street && data.city && data.state) {
                    const state = await this.prisma.state.upsert({
                        where: { name: data.state },
                        update: {},
                        create: {
                            name: data.state,
                            uf: data.state.substring(0, 2).toUpperCase(),
                        },
                    });
                    const city = await this.prisma.city.upsert({
                        where: {
                            name_stateId: {
                                name: data.city,
                                stateId: state.id,
                            },
                        },
                        update: {},
                        create: {
                            name: data.city,
                            stateId: state.id,
                        },
                    });
                    const street = await this.prisma.street.upsert({
                        where: { name: data.street },
                        update: {},
                        create: { name: data.street },
                    });
                    const address = await this.prisma.address.create({
                        data: {
                            streetId: street.id,
                            number: data.number || '',
                            complement: data.complement,
                            zipCode: data.zipCode || '',
                            cityId: city.id,
                        },
                    });
                    addressId = address.id;
                }
            }
        }
        return this.prisma.location.update({
            where: { id },
            data: {
                name: data.name,
                addressId,
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
    }
    async delete(id) {
        const location = await this.prisma.location.findUnique({
            where: { id },
            include: { address: true },
        });
        const deleted = await this.prisma.location.delete({
            where: { id },
        });
        if (location?.addressId) {
            await this.prisma.address.delete({
                where: { id: location?.addressId },
            });
        }
        return deleted;
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map