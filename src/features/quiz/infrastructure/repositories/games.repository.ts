import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/game.entity';

@Injectable()
export class GamesRepository {
  constructor(@InjectRepository(Game) private gamesORM: Repository<Game>) {}

  async createInstance(): Promise<Game> {
    const game = this.gamesORM.create();

    return this.gamesORM.save(game);
  }

  async findById(id: number) {
    return this.gamesORM
      .createQueryBuilder('game')
      .where('game.id = :id', { id })
      .getOne();
  }

  async findActiveGames() {
    // TODO: double check pp.game_id = game.id
    return this.gamesORM
      .createQueryBuilder('game')
      .innerJoin('player_progress', 'pp', 'pp.game_id = game.id')
      .groupBy('game.id')
      .orderBy('game.created_at', 'DESC')
      .limit(1)
      .getOne();
  }

  async deleteAll() {
    const deleteResult = await this.gamesORM.delete({});

    return deleteResult.affected > 0;
  }
}
