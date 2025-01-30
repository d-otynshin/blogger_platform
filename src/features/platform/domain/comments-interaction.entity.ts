import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, JoinColumn
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../accounts/domain/user.entity';

@Entity('comments_interactions')
export class CommentsInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, (comment) => comment.interactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
