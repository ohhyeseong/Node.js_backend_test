import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenExpiredError } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

// TypeORM 리포지토리 모킹
const mockUserRepository = {
  findOne: jest.fn(),
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(() => {
    // JwtService 모킹
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;

    // UserRepository 모킹
    userRepository = mockUserRepository as any;

    guard = new JwtAuthGuard(jwtService, userRepository);

    // 모든 모킹 함수 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
        headers: {},
      };
    });

    it('토큰이 없는 경우 상태코드(401)을 반환해야 합니다.', async () => {
      mockContext.getRequest = jest.fn().mockReturnValue({
        headers: {},
      });

      try {
        await guard.canActivate(mockContext);
        fail('예외가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: '토큰이 없습니다.'
          }
        });
      }
    });

    it('토큰 유형이 Bearer가 아닌 경우 상태코드(401)을 반환해야 합니다.', async () => {
      mockContext.getRequest = jest.fn().mockReturnValue({
        headers: {
          authorization: 'Basic token123',
        },
      });

      try {
        await guard.canActivate(mockContext);
        fail('예외가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          error: {
            code: 'INVALID_TOKEN',
            message: '토큰이 유효하지 않습니다.'
          }
        });
      }
    });

    it('토큰이 만료된 경우 상태코드(401)을 반환해야 합니다.', async () => {
      mockContext.getRequest = jest.fn().mockReturnValue({
        headers: {
          authorization: 'Bearer token123',
        },
      });

      (jwtService.verifyAsync as jest.Mock).mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      try {
        await guard.canActivate(mockContext);
        fail('예외가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          error: {
            code: 'TOKEN_EXPIRED',
            message: '토큰이 만료되었습니다.'
          }
        });
      }
    });

    it('토큰이 유효하지 않은 경우 상태코드(401)을 반환해야 합니다.', async () => {
      mockContext.getRequest = jest.fn().mockReturnValue({
        headers: {
          authorization: 'Bearer token123',
        },
      });

      (jwtService.verifyAsync as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        await guard.canActivate(mockContext);
        fail('예외가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response).toEqual({
          error: {
            code: 'INVALID_TOKEN',
            message: '토큰이 유효하지 않습니다.'
          }
        });
      }
    });

    it('토큰이 유효하고 사용자가 존재하는 경우 true를 반환해야 합니다.', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        createdAt: new Date(),
      };

      mockContext.getRequest = jest.fn().mockReturnValue({
        headers: {
          authorization: 'Bearer token123',
        },
      });

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 1 });
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.getRequest().user).toEqual(mockUser);
    });
  });
}); 