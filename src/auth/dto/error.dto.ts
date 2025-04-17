import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'INVALID_CREDENTIALS',
      message: '아이디 또는 비밀번호가 올바르지 않습니다.'
    }
  })
  error: {
    code: string;
    message: string;
  };
} 

export class TOKEN_EXPIRED {
  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'TOKEN_EXPIRED',
      message: '토큰이 만료되었습니다.'
    }
  })
  error: {
    code: string;
    message: string;
  };
}

export class INVALID_TOKEN {
  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'INVALID_TOKEN',
      message: '토큰이 유효하지 않습니다.'
    }
  })
  error: {
    code: string;
    message: string;
  };
}

export class TOKEN_NOT_FOUND {
  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'TOKEN_NOT_FOUND',
      message: '토큰이 없습니다.'
    }
  })
  error: {
    code: string;
    message: string;
  };
}
