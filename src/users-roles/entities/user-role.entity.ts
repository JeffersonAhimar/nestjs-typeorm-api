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
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'users_roles' })
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.usersRoles, {
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' }) // userId -> user_id
  user: User;

  // optional
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => Role, (role) => role.usersRoles, {
    onUpdate: 'RESTRICT', // default: restrict
    onDelete: 'RESTRICT', // default: restrict
  })
  @JoinColumn({ name: 'role_id' }) // roleId -> role_id
  role: Role;

  // optional
  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  // timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
