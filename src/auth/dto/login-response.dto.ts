import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessResponseDto {
  @ApiProperty({
    description: 'JWT 토큰',
    example: 'eKDIkdfjoakIdkfjpekdkcjdkoIOdjOKJDFOlLDKFJKL'
  })
  token: string;
} 