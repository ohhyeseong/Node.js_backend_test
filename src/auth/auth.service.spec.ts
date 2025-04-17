import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // 모킹된 리포지토리
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  // 모킹된 JWT 서비스
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // 모든 모킹 함수 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      username: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    it('회원가입이 성공적으로 이루어져야 합니다.', async () => {
      // 이미 존재하는 사용자가 없는 경우
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      // 사용자 생성 및 저장
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);
      const createdUser = {
        id: 1,
        username: signupDto.username,
        password: hashedPassword,
        nickname: signupDto.nickname,
        createdAt: new Date(),
      };
      mockUserRepository.create.mockReturnValueOnce(createdUser);
      mockUserRepository.save.mockResolvedValueOnce(createdUser);

      // JWT 토큰 생성
      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValueOnce(token);

      const result = await service.signup(signupDto);

      expect(result).toEqual({ token });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: signupDto.username,
        password: expect.any(String),
        nickname: signupDto.nickname,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: createdUser.id });
    });

    it('이미 존재하는 사용자명으로 회원가입을 시도하면 에러를 반환해야 합니다.', async () => {
      // 이미 존재하는 사용자가 있는 경우
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 1,
        username: signupDto.username,
      });

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: '이미 존재하는 사용자명입니다.',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('이미 존재하는 닉네임으로 회원가입을 시도하면 에러를 반환해야 합니다.', async () => {
      // 사용자명은 존재하지 않지만 닉네임은 존재하는 경우
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 1,
        nickname: signupDto.nickname,
      });

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        error: {
          code: 'NICKNAME_ALREADY_EXISTS',
          message: '이미 존재하는 닉네임입니다.',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('로그인이 성공적으로 이루어져야 합니다.', async () => {
      // 사용자가 존재하고 비밀번호가 일치하는 경우
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        id: 1,
        username: loginDto.username,
        password: hashedPassword,
      };
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      // JWT 토큰 생성
      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValueOnce(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({ token });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id });
    });

    it('존재하지 않는 사용자명으로 로그인을 시도하면 에러를 반환해야 합니다.', async () => {
      // 사용자가 존재하지 않는 경우
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('잘못된 비밀번호로 로그인을 시도하면 에러를 반환해야 합니다.', async () => {
      // 사용자는 존재하지만 비밀번호가 일치하지 않는 경우
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);
      const user = {
        id: 1,
        username: loginDto.username,
        password: hashedPassword,
      };
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    const userId = 1;

    it('프로필 조회가 성공적으로 이루어져야 합니다.', async () => {
      // 사용자가 존재하는 경우
      const user = {
        id: userId,
        username: 'testuser',
        nickname: 'Test User',
        createdAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      const result = await service.getProfile(userId);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          nickname: true,
          createdAt: true,
        },
      });
    });

    it('존재하지 않는 사용자의 프로필을 조회하면 에러를 반환해야 합니다.', async () => {
      // 사용자가 존재하지 않는 경우
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getProfile(userId)).rejects.toThrow();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          nickname: true,
          createdAt: true,
        },
      });
    });
  });
}); 