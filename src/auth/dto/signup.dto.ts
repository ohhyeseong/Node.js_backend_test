import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    description: '사용자 이름',
    example: 'user123'
  })
  username: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자 이상)',
    example: 'password123'
  })
  password: string;

  @ApiProperty({
    description: '닉네임',
    example: '닉네임123'
  })
  nickname: string;
} 