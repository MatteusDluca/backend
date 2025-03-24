import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateEmployee(loginDto: LoginDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        cpf: string;
        password: string;
        salary: number;
        phone: string;
        birthday: string | null;
        workHours: string;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        addressId: string | null;
    }>;
    login(loginDto: LoginDto): Promise<{
        employee: {
            id: string;
            name: string;
            email: string;
        };
        access_token: string;
    }>;
}
