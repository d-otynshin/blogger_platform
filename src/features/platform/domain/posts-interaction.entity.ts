import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../accounts/domain/user.entity';
import { Post } from './post.entity';

@Entity('posts_interactions')
export class PostsInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
