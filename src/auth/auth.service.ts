import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: signupDto.username }
    });
    
    if (existingUser) {
      return {
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: '이미 존재하는 사용자명입니다.'
        }
      };
    }

    const existingNickname = await this.userRepository.findOne({
      where: { nickname: signupDto.nickname }
    });
    
    if (existingNickname) {
      return {
        error: {
          code: 'NICKNAME_ALREADY_EXISTS',
          message: '이미 존재하는 닉네임입니다.'
        }
      };
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    
    const user = this.userRepository.create({
      username: signupDto.username,
      password: hashedPassword,
      nickname: signupDto.nickname,
    });
    
    await this.userRepository.save(user);

    const token = this.jwtService.sign({ sub: user.id });
    return { token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username }
    });
    
    if (!user) {
      return {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
      };
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      return {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
      };
    }

    const token = this.jwtService.sign({ sub: user.id });
    return { token };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        createdAt: true
      }
    });
    
    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        }
      });
    }
    
    return user;
  }
} 