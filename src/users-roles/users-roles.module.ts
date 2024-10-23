import { Module } from '@nestjs/common';
import { UsersRolesService } from './users-roles.service';
import { UsersRolesController } from './users-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [UsersRolesController],
  providers: [UsersRolesService],
})
export class UsersRolesModule {}
