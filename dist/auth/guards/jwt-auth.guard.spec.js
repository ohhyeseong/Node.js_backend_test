"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const jsonwebtoken_1 = require("jsonwebtoken");
const mockUserRepository = {
    findOne: jest.fn(),
};
describe('JwtAuthGuard', () => {
    let guard;
    let jwtService;
    let userRepository;
    beforeEach(() => {
        jwtService = {
            verifyAsync: jest.fn(),
        };
        userRepository = mockUserRepository;
        guard = new jwt_auth_guard_1.JwtAuthGuard(jwtService, userRepository);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
    describe('canActivate', () => {
        let mockContext;
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
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.UnauthorizedException);
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
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.UnauthorizedException);
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
            jwtService.verifyAsync.mockImplementation(() => {
                throw new jsonwebtoken_1.TokenExpiredError('Token expired', new Date());
            });
            try {
                await guard.canActivate(mockContext);
                fail('예외가 발생해야 합니다.');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.UnauthorizedException);
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
            jwtService.verifyAsync.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            try {
                await guard.canActivate(mockContext);
                fail('예외가 발생해야 합니다.');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.UnauthorizedException);
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
            jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const result = await guard.canActivate(mockContext);
            expect(result).toBe(true);
            expect(mockContext.getRequest().user).toEqual(mockUser);
        });
    });
});
//# sourceMappingURL=jwt-auth.guard.spec.js.map