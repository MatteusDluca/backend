import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        employee: {
            id: string;
            name: string;
            email: string;
        };
        access_token: string;
    }>;
}
