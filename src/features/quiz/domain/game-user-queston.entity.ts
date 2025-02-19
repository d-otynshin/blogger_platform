import {
  Unique,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Question } from './question.entity';
import { Game } from './game.entity';
import { User } from '../../accounts/domain/user.entity';

@Entity('games_users_questions')
@Unique(['game', 'user', 'question'])
export class GameUserQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @CreateDateColumn()
  answered_at: Date;

  @Column()
  is_correct: boolean;
}
