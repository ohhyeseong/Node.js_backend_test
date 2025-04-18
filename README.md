# NestJS 인증 API 서버

이 프로젝트는 NestJS를 사용하여 구현된 인증 API 서버입니다. 회원가입, 로그인, 프로필 조회 기능을 제공하며, JWT를 이용한 인증을 구현했습니다.

## 주요 기능

- **회원가입**: 사용자 이름, 비밀번호, 닉네임을 입력하여 계정을 생성합니다.
- **로그인**: 사용자 이름과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.
- **프로필 조회**: JWT 토큰을 이용하여 사용자 프로필 정보를 조회합니다.
- **Swagger 문서**: API 문서를 제공하여 API 사용 방법을 쉽게 확인할 수 있습니다.

## 기술 스택

- **프레임워크**: NestJS
- **데이터베이스**: TypeORM + MySQL
- **인증**: JWT (JSON Web Token)
- **문서화**: Swagger
- **테스트**: Jest

## 설치 및 실행 방법

### 필수 요구사항

- Node.js (v18 이상)
- MySQL 또는 SQLite

### 설치

1. 저장소 클론
```bash
git clone https://github.com/ohhyeseong/Node.js_backend_test.git
cd Node.js_backend_test
```

2. 의존성 설치
```bash
npm install
```
