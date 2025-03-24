import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadService } from '../upload/upload.service';
interface FindAllOptions {
    search?: string;
    page?: number;
    limit?: number;
}
export declare class EmployeesService {
    private prisma;
    private uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
        address: ({
            city: {
                state: {
                    id: string;
                    name: string;
                    uf: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stateId: string;
            };
            street: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            streetId: string;
            complement: string | null;
            zipCode: string;
            cityId: string;
        }) | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        cpf: string;
        salary: number;
        phone: string;
        birthday: string | null;
        workHours: string;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        addressId: string | null;
    }>;
    findAll(options?: FindAllOptions): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: ({
            city: {
                state: {
                    id: string;
                    name: string;
                    uf: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stateId: string;
            };
            street: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            streetId: string;
            complement: string | null;
            zipCode: string;
            cityId: string;
        }) | null;
        email: string;
        cpf: string;
        salary: number;
        phone: string;
        birthday: string | null;
        workHours: string;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: ({
            city: {
                state: {
                    id: string;
                    name: string;
                    uf: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stateId: string;
            };
            street: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            streetId: string;
            complement: string | null;
            zipCode: string;
            cityId: string;
        }) | null;
        email: string;
        cpf: string;
        salary: number;
        phone: string;
        birthday: string | null;
        workHours: string;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        address: ({
            city: {
                state: {
                    id: string;
                    name: string;
                    uf: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stateId: string;
            };
            street: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            streetId: string;
            complement: string | null;
            zipCode: string;
            cityId: string;
        }) | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        cpf: string;
        salary: number;
        phone: string;
        birthday: string | null;
        workHours: string;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        addressId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    uploadProfileImage(id: string, imageBuffer: Buffer, filename: string): Promise<string>;
    generatePdf(): Promise<Buffer>;
    generateEmployeePdf(id: string): Promise<Buffer>;
}
export {};
