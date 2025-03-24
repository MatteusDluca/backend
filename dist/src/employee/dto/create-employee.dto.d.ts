import { Role } from '@prisma/client';
export declare class CreateEmployeeDto {
    name: string;
    email: string;
    cpf: string;
    password: string;
    salary: number;
    phone: string;
    birthday?: string;
    workHours: string;
    role?: Role;
    imageUrl?: string;
    street: string;
    number: string;
    complement?: string;
    zipCode: string;
    city: string;
    state: string;
}
