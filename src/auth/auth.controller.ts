import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ErrorResponseDto, TOKEN_EXPIRED, INVALID_TOKEN, TOKEN_NOT_FOUND } from './dto/error.dto';
import { ProfileResponseDto } from './dto/profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 또는 중복된 사용자/닉네임', type: ErrorResponseDto })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '로그인 실패 (사용자를 찾을 수 없음 또는 비밀번호 불일치)', type: ErrorResponseDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: '토큰이 만료되었습니다.', type: TOKEN_EXPIRED })
  @ApiResponse({ status: 401, description: '토큰이 유효하지 않습니다.', type: INVALID_TOKEN })
  @ApiResponse({ status: 401, description: '토큰이 없습니다.', type: TOKEN_NOT_FOUND })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
} 