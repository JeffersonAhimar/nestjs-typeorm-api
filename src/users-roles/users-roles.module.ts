import { Module } from '@nestjs/common';
import { UsersRolesService } from './users-roles.service';
import { UsersRolesController } from './users-roles.controller';

@Module({
  controllers: [UsersRolesController],
  providers: [UsersRolesService],
})
export class UsersRolesModule {}
