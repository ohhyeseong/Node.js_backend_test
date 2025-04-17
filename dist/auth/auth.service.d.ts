import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
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
    getProfile(userId: number): Promise<User>;
}
