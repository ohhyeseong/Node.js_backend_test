import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // 모킹된 리포지토리
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  // 모킹된 JWT 서비스
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            getProfile: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('회원가입', () => {
    const signupDto = {
      username: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    it('새로운 사용자를 성공적으로 생성해야 합니다', async () => {
      const expectedResult = {
        username: signupDto.username,
        nickname: signupDto.nickname,
      };

      (service.signup as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.signup(signupDto);

      expect(result).toEqual(expectedResult);
      expect(service.signup).toHaveBeenCalledWith(signupDto);
    });

    it('이미 존재하는 사용자명인 경우 UnauthorizedException을 발생시켜야 합니다', async () => {
      const error = new UnauthorizedException({
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: '이미 가입된 사용자입니다.'
        }
      });

      (service.signup as jest.Mock).mockRejectedValue(error);

      await expect(controller.signup(signupDto)).rejects.toThrow(UnauthorizedException);
      
      try {
        await controller.signup(signupDto);
      } catch (error) {
        expect(error.response).toEqual({
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: '이미 가입된 사용자입니다.'
          }
        });
      }
    });
  });

  describe('로그인', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('로그인 성공 시 토큰을 반환해야 합니다', async () => {
      const expectedResult = {
        token: 'test-token',
      };

      (service.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('잘못된 자격 증명인 경우 UnauthorizedException을 발생시켜야 합니다', async () => {
      const error = new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
      });

      (service.login as jest.Mock).mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      
      try {
        await controller.login(loginDto);
      } catch (error) {
        expect(error.response).toEqual({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.'
          }
        });
      }
    });
  });

  describe('프로필 조회', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      createdAt: new Date(),
    };

    it('사용자 프로필을 반환해야 합니다', async () => {
      const mockRequest = {
        user: { id: 1 },
      };

      (service.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });
}); 