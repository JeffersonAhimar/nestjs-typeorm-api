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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { GoogleAuthGuard } from './guards/google-auth.guard';

// JwtAuthGuard: Public -> RolesGuard: Roles -> ...
@ApiBearerAuth('accessToken')
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  // JwtAuthGuard: Public -> RolesGuard: Roles
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req) {
    const user = req.user as User;
    return this.authService.logout(user.id);
  }

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user);
    res.redirect(`http://localhost:5173?token=${response.accessToken}`);
  }
}
