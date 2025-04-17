"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
describe('AuthController', () => {
    let controller;
    let service;
    const mockUserRepository = {
        findOne: jest.fn(),
    };
    const mockJwtService = {
        verifyAsync: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        signup: jest.fn(),
                        login: jest.fn(),
                        getProfile: jest.fn(),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                jwt_auth_guard_1.JwtAuthGuard,
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        service = module.get(auth_service_1.AuthService);
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
            service.signup.mockResolvedValue(expectedResult);
            const result = await controller.signup(signupDto);
            expect(result).toEqual(expectedResult);
            expect(service.signup).toHaveBeenCalledWith(signupDto);
        });
        it('이미 존재하는 사용자명인 경우 UnauthorizedException을 발생시켜야 합니다', async () => {
            const error = new common_1.UnauthorizedException({
                error: {
                    code: 'USER_ALREADY_EXISTS',
                    message: '이미 가입된 사용자입니다.'
                }
            });
            service.signup.mockRejectedValue(error);
            await expect(controller.signup(signupDto)).rejects.toThrow(common_1.UnauthorizedException);
            try {
                await controller.signup(signupDto);
            }
            catch (error) {
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
            service.login.mockResolvedValue(expectedResult);
            const result = await controller.login(loginDto);
            expect(result).toEqual(expectedResult);
            expect(service.login).toHaveBeenCalledWith(loginDto);
        });
        it('잘못된 자격 증명인 경우 UnauthorizedException을 발생시켜야 합니다', async () => {
            const error = new common_1.UnauthorizedException({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: '아이디 또는 비밀번호가 올바르지 않습니다.'
                }
            });
            service.login.mockRejectedValue(error);
            await expect(controller.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            try {
                await controller.login(loginDto);
            }
            catch (error) {
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
            service.getProfile.mockResolvedValue(mockUser);
            const result = await controller.getProfile(mockRequest);
            expect(result).toEqual(mockUser);
            expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map