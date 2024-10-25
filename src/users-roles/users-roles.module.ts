import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersRolesService } from './users-roles.service';
import { UsersRolesController } from './users-roles.controller';
import { UserRole } from './entities/user-role.entity';

import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole]), UsersModule, RolesModule],
  controllers: [UsersRolesController],
  providers: [UsersRolesService],
})
export class UsersRolesModule {}
