import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn, OneToMany
} from 'typeorm';
import { PostsInteraction } from '../../platform/domain/posts-interaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  login: string;

  @Column()
  password_hash: string;

  @Column()
  confirmation_code: string;

  @Column({ default: false })
  is_confirmed: boolean;

  @OneToMany(() => PostsInteraction, (interaction) => interaction.user)
  interactions: PostsInteraction[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
