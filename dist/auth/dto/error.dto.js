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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_NOT_FOUND = exports.INVALID_TOKEN = exports.TOKEN_EXPIRED = exports.ErrorResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ErrorResponseDto {
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '에러 정보',
        example: {
            code: 'INVALID_CREDENTIALS',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
    }),
    __metadata("design:type", Object)
], ErrorResponseDto.prototype, "error", void 0);
class TOKEN_EXPIRED {
}
exports.TOKEN_EXPIRED = TOKEN_EXPIRED;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '에러 정보',
        example: {
            code: 'TOKEN_EXPIRED',
            message: '토큰이 만료되었습니다.'
        }
    }),
    __metadata("design:type", Object)
], TOKEN_EXPIRED.prototype, "error", void 0);
class INVALID_TOKEN {
}
exports.INVALID_TOKEN = INVALID_TOKEN;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '에러 정보',
        example: {
            code: 'INVALID_TOKEN',
            message: '토큰이 유효하지 않습니다.'
        }
    }),
    __metadata("design:type", Object)
], INVALID_TOKEN.prototype, "error", void 0);
class TOKEN_NOT_FOUND {
}
exports.TOKEN_NOT_FOUND = TOKEN_NOT_FOUND;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '에러 정보',
        example: {
            code: 'TOKEN_NOT_FOUND',
            message: '토큰이 없습니다.'
        }
    }),
    __metadata("design:type", Object)
], TOKEN_NOT_FOUND.prototype, "error", void 0);
//# sourceMappingURL=error.dto.js.map