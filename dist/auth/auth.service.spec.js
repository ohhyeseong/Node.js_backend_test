"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
describe('AuthService', () => {
    let service;
    let userRepository;
    let jwtService;
    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        jwtService = module.get(jwt_1.JwtService);
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
            mockUserRepository.findOne.mockResolvedValueOnce(null);
            mockUserRepository.findOne.mockResolvedValueOnce(null);
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
            const hashedPassword = await bcrypt.hash(loginDto.password, 10);
            const user = {
                id: 1,
                username: loginDto.username,
                password: hashedPassword,
            };
            mockUserRepository.findOne.mockResolvedValueOnce(user);
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
//# sourceMappingURL=auth.service.spec.js.map