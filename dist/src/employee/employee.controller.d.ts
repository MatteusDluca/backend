import { Response } from 'express';
import { EmployeesService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    private readonly logger;
    constructor(employeesService: EmployeesService);
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
    findAll(search?: string, page?: number, limit?: number): Promise<{
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
    generatePdf(res: Response): Promise<void>;
    generateEmployeePdf(id: string, res: Response): Promise<void>;
    uploadProfileImage(id: string, file: Express.Multer.File): Promise<string>;
}
