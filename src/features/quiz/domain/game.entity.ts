import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
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

  @Column({ nullable: true })
  started_at: Date | null;

  @Column({ nullable: true })
  finished_at: Date | null;

  @OneToMany(() => GameUserQuestion, (guq) => guq.game)
  games_users_questions: GameUserQuestion[];
}
