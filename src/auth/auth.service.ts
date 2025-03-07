import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

import configuration from 'src/configuration/configuration';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PayloadToken } from './interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
  ) {}

  // controllers - start

  async login(user: User) {
    const { accessToken, refreshToken } = await this.generateJwtTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async refresh(userId: number) {
    const user = await this.usersService.findOne(userId);
    const { accessToken, refreshToken } = await this.generateJwtTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // controllers - end

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async validateUserRefreshToken(userId: number, refreshToken: string) {
    const user = this.usersService.findOne(userId);
    if (!(await user).refreshToken) {
      return null;
    }

    const isMatch = await argon2.verify(
      (await user).refreshToken,
      refreshToken,
    );
    if (!isMatch) {
      return null;
    }

    return user;
  }

  // jwt tokens - start

  generateJwtPayload(user: User) {
    const payload: PayloadToken = { sub: user.id, email: user.email };
    return payload;
  }

  generateJwtAccessToken(user: User) {
    const payload = this.generateJwtPayload(user);
    const accessToken = this.jwtService.sign(payload); // use default config from module
    return accessToken;
  }

  generateJwtRefreshToken(user: User) {
    const payload = this.generateJwtPayload(user);
    const options: JwtSignOptions = {
      secret: this.configService.jwt.refreshSecret,
      expiresIn: this.configService.jwt.refreshExpiration,
    };
    const refreshToken = this.jwtService.sign(payload, options);
    return refreshToken;
  }

  async generateJwtTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateJwtAccessToken(user),
      this.generateJwtRefreshToken(user),
    ]);
    return { accessToken, refreshToken };
  }

  // jwt tokens - end
}
