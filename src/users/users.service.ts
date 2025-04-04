import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  findAll(includeDeleted = false) {
    if (includeDeleted) {
      return this.userRepository.find({ withDeleted: true });
    }
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneWithRoles(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['usersRoles', 'usersRoles.role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findByEmail(email: string) {
    const user = this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const finalUpdateUserDto = { ...updateUserDto };
    if (updateUserDto.password) {
      finalUpdateUserDto.password = await argon2.hash(updateUserDto.password);
    }
    this.userRepository.merge(user, finalUpdateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    const user = await this.findOne(id);

    const hashedRefreshToken = refreshToken
      ? await argon2.hash(refreshToken)
      : null;

    // return this.userRepository.update({ id }, { refreshToken: hashedRefreshToken });
    this.userRepository.merge(user, { refreshToken: hashedRefreshToken });
    return this.userRepository.save(user);
  }

  async softRemove(id: number) {
    const user = await this.findOne(id); // doesn't find soft deleted rows
    return this.userRepository.softRemove(user);
  }

  restore(id: number) {
    return this.userRepository.restore({ id: id });
  }
}
