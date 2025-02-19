import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/game.entity';

@Injectable()
export class QuizRepository {
  constructor(@InjectRepository(Game) private gamesOrm: Repository<Game>) {}

  async createInstance(): Promise<Game> {
    const game = this.gamesOrm.create();

    return this.gamesOrm.save(game);
  }

  async findCurrentGame(userId: string) {
    return await this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect(
        'game.players_questions',
        'players_questions',
        'players_questions.game_id = game.id',
      )
      .innerJoinAndSelect('players_questions.user_id', 'player')
      .where('game.status = :status', { status: GameStatus.ACTIVE })
      .andWhere('guq.user_id = :userId', { userId })
      .getOne();
  }

  async findById(id: number) {
    const rawData = await this.gamesOrm
      .createQueryBuilder('game')
      .innerJoin('games_users_questions', 'guq', 'guq.game_id = game.id')
      .innerJoin('users', 'user', 'guq.user_id = user.id')
      .where('game.id = :id', { id })
      .select([
        'game.id AS gameId',
        'game.status AS gameStatus',
        'game.created_at AS gameCreatedAt',
        'game.updated_at AS gameUpdatedAt',
        'user.id AS userId',
        'user.login AS userLogin',
      ])
      .getRawMany();

    // TODO: move mapper out
    const groupedGames = rawData.reduce((acc, row) => {
      const {
        gameId,
        gameStatus,
        gameCreatedAt,
        gameUpdatedAt,
        userId,
        userLogin,
      } = row;

      if (!acc[gameId]) {
        acc[gameId] = {
          gameId,
          gameStatus,
          gameCreatedAt,
          gameUpdatedAt,
          users: [],
        };
      }

      acc[gameId].users.push({ userId, userLogin });

      return acc;
    }, {});

    return Object.values(groupedGames);
  }

  async findActiveGames() {
    return this.gamesOrm
      .createQueryBuilder('game')
      .where('game.status = :status', { status: GameStatus.ACTIVE })
      .getOne();
  }

  async deleteAll() {
    const deleteResult = await this.gamesOrm.delete({});

    return deleteResult.affected > 0;
  }
}
