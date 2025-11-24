import * as cookieParser from 'cookie-parser';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Mysql1451ExceptionFilter } from './common/filters/mysql-1451-exception.filter';
import { Mysql1062ExceptionFilter } from './common/filters/mysql-1062-exception.filter';
import configuration from './configuration/configuration';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthCookieGuard } from './auth/guards/jwt-auth-cookie.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ignore
      forbidNonWhitelisted: true, // alert extra properties
      transformOptions: {
        enableImplicitConversion: true, // query param -> int if it's a number
      },
    }),
  );

  // global interceptors
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); // to transform data before return, e.g. @exclude

  // global guards (executed in order from left to right) JwtAuthGuard -> ...
  app.useGlobalGuards(
    app.get(ThrottlerGuard), // rate limiting
    // app.get(JwtAuthGuard), // authentication for all controllers - @Public() to pass
    app.get(JwtAuthCookieGuard), // authentication for all controllers - @Public() to pass
    app.get(RolesGuard), // RBAC: role-based access control - @Roles()
  );

  // global filters
  // app.useGlobalFilters(new TypeormExceptionFilter());
  app.useGlobalFilters(
    new Mysql1451ExceptionFilter(),
    new Mysql1062ExceptionFilter(),
  );

  // versioning /v1 /v2 ...
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // openApi (swagger) config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS TypeORM API')
    .setDescription('@JeffersonAhimar')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'accessToken',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // enable CORS to allow requests from the frontend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, // allows cookies and other credentials to be sent in requests
  });

  // enables parsing of cookies from incoming HTTP requests
  app.use(cookieParser());

  // app port
  const configService = app.get(configuration.KEY);
  await app.listen(configService.port);
}
bootstrap();
