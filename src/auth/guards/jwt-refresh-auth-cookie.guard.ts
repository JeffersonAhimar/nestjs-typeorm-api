import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthCookieGuard extends AuthGuard(
  'jwt-refresh-cookie',
) {}
