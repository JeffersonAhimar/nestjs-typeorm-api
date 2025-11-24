import * as ms from 'ms';
import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  Req,
  Body,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import { JwtRefreshAuthCookieGuard } from './guards/jwt-refresh-auth-cookie.guard';
import configuration from 'src/configuration/configuration';
import { ConfigType } from '@nestjs/config';

// JwtAuthGuard: Public -> RolesGuard: Roles -> ...
@ApiBearerAuth('accessToken')
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
  ) {}

  // JwtAuthGuard: Public -> RolesGuard: Roles -> LocalAuthGuard
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    const user = req.user as User;
    return this.authService.login(user);
  }

  // JwtAuthGuard: Public -> RolesGuard: Roles -> JwtRefreshAuthGuard
  @UseGuards(JwtRefreshAuthGuard)
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req) {
    const user = req.user as User;
    return this.authService.refresh(user.id);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('cookie/login')
  @HttpCode(HttpStatus.OK)
  async cookieLogin(@Request() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const { accessToken, refreshToken, accessExpiration, refreshExpiration } =
      await this.authService.login(user);

    const accessMaxAge = ms(accessExpiration);
    const refreshMaxAge = ms(refreshExpiration); // 7d -> miliseconds

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      path: '/',
      maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge, // 7 * 24 * 60 * 60 * 1000
    });

    return { message: 'Logged in successfully' };
  }

  @UseGuards(JwtRefreshAuthCookieGuard)
  @Public()
  @Post('cookie/refresh')
  @HttpCode(HttpStatus.OK)
  async cookieRefresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    const { accessToken, refreshToken, accessExpiration, refreshExpiration } =
      await this.authService.refresh(user.id);

    const accessMaxAge = ms(accessExpiration);
    const refreshMaxAge = ms(refreshExpiration); // 7d -> miliseconds

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      path: '/',
      maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      // path: '/auth/cookie/refresh', // limit cookie to this path only
      path: '/',
      maxAge: refreshMaxAge, // 7 * 24 * 60 * 60 * 1000
    });

    return { message: 'Tokens refreshed successfully' };
  }

  // JwtAuthGuard: Public -> RolesGuard: Roles
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req) {
    const user = req.user as User;
    return this.authService.logout(user.id);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return { statusCode: HttpStatus.OK, ...result };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const { accessToken, refreshToken, accessExpiration, refreshExpiration } =
      await this.authService.login(req.user);
    // res.redirect(`${this.configService.frontendURL}?token=${accessToken}`); // not secure

    const accessMaxAge = ms(accessExpiration);
    const refreshMaxAge = ms(refreshExpiration); // 7d -> miliseconds

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      path: '/',
      maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge, // 7 * 24 * 60 * 60 * 1000
    });

    const frontendUrl = this.configService.frontendURL;
    res.redirect(frontendUrl);
  }
}
