import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

import configuration from 'src/configuration/configuration';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PayloadToken } from './interfaces/token.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailsService } from 'src/mails/mails.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
    private mailsService: MailsService,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    try {
      const user = await this.usersService.findByEmail(email);
      const { resetPasswordToken } = this.generateResetPasswordToken(user);

      const frontendUrl = this.configService.frontendURL;
      const resetPasswordLink = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

      const createMailDto = {
        emailTo: user.email,
        nameTo: user.name,
        url: resetPasswordLink,
      };
      await this.mailsService.sendMail(
        createMailDto,
        'Reset your password',
        'reset-password',
      );
    } catch (error) {
      console.log(
        `[ForgotPassword] Email not found or error: ${error.message}`,
      );
    }

    return {
      success: true,
      message:
        'If the email is registered, you will receive a reset link shortly.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      const payload = await this.verifyResetPasswordToken(token);
      await this.usersService.updatePassword(payload.sub, newPassword);
    } catch (error) {
      console.log(`[ResetPassword] Error: ${error.message}`);
    }

    return {
      success: true,
      message: 'If the token is valid, your password has been updated.',
    };
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

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.usersService.create(googleUser);
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

  generateResetPasswordToken(user: User) {
    const payload = this.generateJwtPayload(user);
    const options: JwtSignOptions = {
      secret: this.configService.jwt.resetPasswordSecret,
      expiresIn: this.configService.jwt.resetPasswordExpiration,
    };
    const resetPasswordToken = this.jwtService.sign(payload, options);
    return { resetPasswordToken };
  }

  async verifyResetPasswordToken(token: string) {
    try {
      const options: JwtSignOptions = {
        secret: this.configService.jwt.resetPasswordSecret,
      };
      const payload = await this.jwtService.verifyAsync(token, options);
      return payload;
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  // jwt tokens - end
}
