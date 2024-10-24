import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';

import configuration from 'src/configuration/configuration';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // global config for jwt
    JwtModule.registerAsync({
      inject: [configuration.KEY],
      useFactory: (configService: ConfigType<typeof configuration>) => {
        return {
          secret: configService.jwt.secret,
          signOptions: {
            expiresIn: configService.jwt.expiration, // 30 (seconds) - 1m (minutes) - 1h (hours) - 1d (days)
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    JwtRefreshStrategy,
    JwtRefreshAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
