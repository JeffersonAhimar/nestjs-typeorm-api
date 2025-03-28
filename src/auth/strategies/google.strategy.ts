import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { ConfigType } from '@nestjs/config';
import configuration from 'src/configuration/configuration';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.googleOauth.clientID,
      clientSecret: configService.googleOauth.clientSecret,
      callbackURL: configService.googleOauth.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // console.log({ profile });
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: `${profile.name.givenName}`,
      password: '',
      avatarUrl: profile.photos[0].value,
    });
    done(null, user);
  }
}
