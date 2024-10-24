import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

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
    app.get(JwtAuthGuard), // authentication for all controllers - @Public() to pass
    app.get(RolesGuard), // RBAC: role-based access control - @Roles()
  );

  // app port
  await app.listen(3000);
}
bootstrap();
