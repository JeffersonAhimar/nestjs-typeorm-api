import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RolesV2Service } from './roles-v2.service';

@ApiBearerAuth('accessToken')
@ApiTags('roles-v2')
@Controller({ path: 'roles', version: '2' })
export class RolesV2Controller {
  constructor(private readonly rolesService: RolesV2Service) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
