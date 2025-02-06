import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerProgress } from './player-progress.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.game)
  @Column()
  players_progresses: PlayerProgress[];
}
