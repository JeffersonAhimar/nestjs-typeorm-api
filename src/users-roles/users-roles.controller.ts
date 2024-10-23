import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersRolesService } from './users-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users-roles')
export class UsersRolesController {
  constructor(private readonly usersRolesService: UsersRolesService) {}

  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.usersRolesService.create(createUserRoleDto);
  }

  @Get()
  findAll() {
    return this.usersRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersRolesService.update(+id, updateUserRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersRolesService.remove(+id);
  }
}
