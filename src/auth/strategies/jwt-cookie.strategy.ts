import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';

import configuration from 'src/configuration/configuration';
import { PayloadToken } from '../interfaces/token.interface';
import { Request } from 'express';

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(
  Strategy,
  'jwt-cookie',
) {
  constructor(
    @Inject(configuration.KEY) configService: ConfigType<typeof configuration>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // console.log('Cookies:', req.cookies);
          return req?.cookies?.accessToken || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.accessSecret,
    });
  }

  async validate(payload: PayloadToken) {
    // return payload;
    return { sub: payload.sub, email: payload.email };
  }
}
