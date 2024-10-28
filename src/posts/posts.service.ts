import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

import { UsersService } from 'src/users/users.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const newPost = this.postRepository.create(createPostDto);

    if (createPostDto.userId) {
      await this.usersService.findOne(createPostDto.userId);
    }

    return this.postRepository.save(newPost);
  }

  findAll(paginationDto: PaginationDto) {
    return this.postRepository.find({
      skip: paginationDto.skip,
      take: paginationDto.take,
    });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findOneWithDetails(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (updatePostDto.userId) {
      await this.usersService.findOne(updatePostDto.userId);
    }

    this.postRepository.merge(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    return this.postRepository.remove(post);
  }
}
