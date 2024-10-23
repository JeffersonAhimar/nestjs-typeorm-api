import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.posts, {
    onUpdate: 'RESTRICT', // default: restrict
    onDelete: 'RESTRICT', // default: restrict
  })
  @JoinColumn({ name: 'user_id' }) // optional (camelCase -> snake_case)
  user: User;

  // optional
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  // timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
