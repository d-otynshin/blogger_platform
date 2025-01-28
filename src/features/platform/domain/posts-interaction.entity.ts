import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { LikeStatus } from '../dto/interaction-dto';
import { User } from '../../accounts/domain/user.entity';

@Entity('posts_interactions')
export class PostsInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  action: LikeStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
