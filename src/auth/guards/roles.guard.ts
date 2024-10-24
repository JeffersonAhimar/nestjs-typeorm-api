import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './../decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PayloadToken } from '../interfaces/token.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const requiredRoles = this.reflector.get<RoleEnum[]>(ROLES_KEY,context.getHandler(),); // only works on methods, not top of @controller
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // no required roles = allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as PayloadToken;
    if (!user) {
      throw new UnauthorizedException('Not allowed');
    }

    // get roles from db
    const userWithRoles = await this.usersService.findOneWithRoles(user.sub);
    // format roles
    const userRoles = userWithRoles.usersRoles.map(
      (userRole) => userRole.role.name,
    );

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    // by default ->  throw new ForbiddenException()
    if (!hasRequiredRole) {
      throw new ForbiddenException('Access denied');
    }

    // validate roles
    return hasRequiredRole;
  }
}
