"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const jsonwebtoken_1 = require("jsonwebtoken");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(jwtService, userRepository) {
        super();
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException({
                error: {
                    code: 'TOKEN_NOT_FOUND',
                    message: '토큰이 없습니다.'
                }
            });
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer') {
            throw new common_1.UnauthorizedException({
                error: {
                    code: 'INVALID_TOKEN',
                    message: '토큰이 유효하지 않습니다.'
                }
            });
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });
            if (!user) {
                throw new common_1.UnauthorizedException({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: '사용자를 찾을 수 없습니다.'
                    }
                });
            }
            request.user = user;
            return true;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new common_1.UnauthorizedException({
                    error: {
                        code: 'TOKEN_EXPIRED',
                        message: '토큰이 만료되었습니다.'
                    }
                });
            }
            throw new common_1.UnauthorizedException({
                error: {
                    code: 'INVALID_TOKEN',
                    message: '토큰이 유효하지 않습니다.'
                }
            });
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map