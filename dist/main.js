"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('바로 인턴 과제를 위한 API(회원가입/로그인/Auth)')
        .setDescription('바로 인턴 과제를 위한 API 문서')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
        },
    });
    await app.listen(3000, '0.0.0.0');
    console.log(`서버가 0.0.0.0:3000에서 실행되었습니다.`);
    console.log(`API 문서: http://0.0.0.0:3000/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map