import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesV2Service {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  findAll() {
    return this.roleRepository.find({ relations: ['usersRoles'] });
  }
}
