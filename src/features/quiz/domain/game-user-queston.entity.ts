import {
  Unique,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Game } from './game.entity';
import { Question } from './question.entity';
import { User } from '../../accounts/domain/user.entity';

@Entity('games_users_questions')
@Unique(['game', 'user', 'question'])
export class GameUserQuestion {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  answered_at: Date | null;

  @Column({ nullable: true })
  is_correct: boolean;

  @Column({ nullable: true })
  points: number | null;

  @Column({ nullable: true })
  bonus: number | null;
}
