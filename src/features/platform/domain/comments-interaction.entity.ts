import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../accounts/domain/user.entity';

@Entity('comments_interactions')
export class CommentsInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
