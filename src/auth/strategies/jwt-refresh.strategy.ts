import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import configuration from 'src/configuration/configuration';
import { AuthService } from '../auth.service';
import { PayloadToken } from '../interfaces/token.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(configuration.KEY) configService: ConfigType<typeof configuration>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.refreshSecret, // validate jwt refresh token
      passReqToCallback: true, // to access to request
    });
  }

  async validate(req: Request, payload: PayloadToken) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    const userId = payload.sub;
    // return payload;
    const user = await this.authService.validateUserRefreshToken(
      userId,
      refreshToken,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    return user;
  }
}
