import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '사용자 이름',
    example: 'user123'
  })
  username: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '사용자1'
  })
  nickname: string;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-03-20T12:00:00Z'
  })
  createdAt: Date;
} 