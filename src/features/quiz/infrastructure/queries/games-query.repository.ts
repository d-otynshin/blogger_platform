import { Injectable } from '@nestjs/common';
import {
  formatSortDirection,
  toSnakeCase,
} from '../../../../core/libs/transfrom-snake-case';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/game.entity';
import { Repository } from 'typeorm';
import { GameViewDto } from '../../dto/game-view.dto';
import { GetGamesQueryParams } from '../../lib/helpers';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectRepository(Game) private gamesOrm: Repository<Game>) {}

  async findAll(query: GetGamesQueryParams, userId: string) {
    const queryBuilder = this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.games_users_questions', 'guq')
      .innerJoinAndSelect('guq.user', 'user')
      .innerJoinAndSelect('guq.question', 'question')
      .where(
        'game.id IN (SELECT guq2.game_id FROM games_users_questions guq2 WHERE guq2.user_id = :userId)',
        { userId },
      );

    queryBuilder.orderBy(
      toSnakeCase(query.sortBy),
      formatSortDirection(query.sortDirection),
    );

    queryBuilder.skip(query.calculateSkip());
    queryBuilder.take(query.pageSize);

    const [games, totalCount] = await queryBuilder.getManyAndCount();

    const items = games.map(GameViewDto.mapToView);

    console.log('GAMES VIEW DTOs', items);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
