
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'cognito_sub', type: 'char', length: 36, unique: true })
  cognitoSub: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
