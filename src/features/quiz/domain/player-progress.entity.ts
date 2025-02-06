import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../accounts/domain/user.entity';
import { Game } from './game.entity';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ManyToOne(() => User)
  @Column({ name: 'player_account_id' })
  player_account: User;

  @ManyToOne(() => Game)
  @Column({ name: 'game_id' })
  game: Game;
}
