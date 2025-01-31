import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { LikeStatus } from '../dto/interaction-dto';
import { User } from '../../accounts/domain/user.entity';

@Entity('comments_interactions')
export class CommentsInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: LikeStatus;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
