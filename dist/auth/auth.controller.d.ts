import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
        error: {
            code: string;
            message: string;
        };
        token?: undefined;
    } | {
        token: string;
        error?: undefined;
    }>;
    login(loginDto: LoginDto): Promise<{
        error: {
            code: string;
            message: string;
        };
        token?: undefined;
    } | {
        token: string;
        error?: undefined;
    }>;
    getProfile(req: any): Promise<import("./entities/user.entity").User>;
}
