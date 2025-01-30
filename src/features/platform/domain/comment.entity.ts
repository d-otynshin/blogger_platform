import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../accounts/domain/user.entity';
import { Post } from './post.entity';
import { CommentsInteraction } from './comments-interaction.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentator_id' })
  commentator: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany(() => CommentsInteraction, (interaction) => interaction.comment)
  interactions: CommentsInteraction[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
