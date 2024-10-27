import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { RolesController } from './v1/roles.controller';
import { RolesService } from './v1/roles.service';
import { RolesV2Controller } from './v2/roles-v2.controller';
import { RolesV2Service } from './v2/roles-v2.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController, RolesV2Controller],
  providers: [RolesService, RolesV2Service],
  exports: [RolesService],
})
export class RolesModule {}
