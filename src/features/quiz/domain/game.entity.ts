import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameUserQuestion } from './game-user-queston.entity';

export enum GameStatus {
  PENDING = 'PendingSecondPlayer',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('increment')
  public id: string;

  @Column({ default: GameStatus.PENDING })
  status: GameStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => GameUserQuestion, (guq) => guq.game)
  games_users_questions: GameUserQuestion[];
}
