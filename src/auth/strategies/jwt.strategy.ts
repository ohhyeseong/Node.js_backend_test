import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload:', payload);
    
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: {
          id: true,
          username: true,
          nickname: true,
          createdAt: true
        }
      });

      console.log('JWT Strategy - Found User:', user);

      if (!user) {
        throw new UnauthorizedException({
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.'
          }
        });
      }

      return user;
    } catch (error) {
      console.error('JWT Strategy - Error:', error);
      throw new UnauthorizedException({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: '토큰이 유효하지 않습니다.'
        }
      });
    }
  }
} 