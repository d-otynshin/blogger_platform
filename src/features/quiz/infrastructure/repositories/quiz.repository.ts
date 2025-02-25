import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/game.entity';
import { GameUserQuestion } from '../../domain/game-user-queston.entity';
import { Question } from '../../domain/question.entity';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exceptions';
import { RecordAnswerDto } from '../../dto/answer.dto';
import { PlayersQueryParams } from '../../lib/helpers';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Game)
    private gamesOrm: Repository<Game>,

    @InjectRepository(Question)
    private questionsOrm: Repository<Question>,

    @InjectRepository(GameUserQuestion)
    private gameUserQuestionsOrm: Repository<GameUserQuestion>,

    private readonly dataSource: DataSource,
  ) {}

  async createGameInstance(): Promise<Game> {
    const game = this.gamesOrm.create();

    return this.gamesOrm.save(game);
  }

  async isPlaying(userId: string): Promise<boolean> {
    return await this.gameUserQuestionsOrm
      .createQueryBuilder('guq')
      .innerJoin('guq.game', 'game')
      .where('guq.user_id = :userId', { userId })
      .andWhere('game.status IN (:...statuses)', {
        statuses: [GameStatus.PENDING, GameStatus.ACTIVE],
      })
      .getExists();
  }

  async initGame({ gameId, userId }) {
    const questions = await this.questionsOrm
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .where('published = true')
      .limit(5)
      .getMany();

    const gameUserQuestions = [];

    for (const question of questions) {
      gameUserQuestions.push(
        this.gameUserQuestionsOrm.create({
          game: { id: gameId },
          user: { id: userId },
          question: { id: question.id },
        }),
      );
    }

    return this.gameUserQuestionsOrm.save(gameUserQuestions);
  }

  async countPlayersInGame(gameId: string): Promise<number> {
    const userCount = await this.gameUserQuestionsOrm
      .createQueryBuilder('guq')
      .select('COUNT(DISTINCT guq.user_id)', 'count')
      .where('guq.game_id = :gameId', { gameId })
      .getRawOne();

    return Number(userCount.count);
  }

  async addPlayer({ gameId, userId }: { gameId: string; userId: string }) {
    const game = await this.gamesOrm.findOne({ where: { id: gameId } });
    if (!game) throw NotFoundDomainException.create('Game not found');

    // Check if the user is already in the game
    const existingEntry = await this.gameUserQuestionsOrm.findOne({
      where: { game: { id: gameId }, user: { id: userId } },
    });

    if (existingEntry) {
      throw ForbiddenDomainException.create('User is already in this game');
    }

    const playersCount = await this.countPlayersInGame(gameId);
    if (playersCount >= 2)
      throw ForbiddenDomainException.create('Game capacity is full');

    const gameQuestions = await this.gameUserQuestionsOrm
      .createQueryBuilder('guq')
      .where('guq.game_id = :gameId', { gameId })
      .select('DISTINCT guq.question_id', 'questionId')
      .getRawMany();

    if (gameQuestions.length === 0) {
      console.log('Games questions', gameQuestions);
      throw NotFoundDomainException.create('No questions found for this game');
    }

    const newEntries = gameQuestions.map(({ questionId }) =>
      this.gameUserQuestionsOrm.create({
        game: { id: gameId },
        user: { id: userId },
        question: { id: questionId },
      }),
    );

    await this.gamesOrm
      .createQueryBuilder('game')
      .update()
      .set({ started_at: () => 'NOW()' })
      .where('game.id = :id', { id: gameId })
      .execute();

    await this.gameUserQuestionsOrm.save(newEntries);
  }

  async updateGameStatus(gameId: string, status: GameStatus) {
    return await this.gamesOrm
      .createQueryBuilder('game')
      .update()
      .set({ status: status })
      .where('game.id = :id', { id: gameId })
      .execute();
  }

  async finishGame(gameId: string) {
    return await this.gamesOrm
      .createQueryBuilder('game')
      .update()
      .set({ status: GameStatus.FINISHED, finished_at: new Date() })
      .where('game.id = :id', { id: gameId })
      .execute();
  }

  async findActiveGameId(userId: string): Promise<string | null> {
    const gameRow: { game_id: string } | null = await this.gamesOrm
      .createQueryBuilder('game')
      .innerJoin('game.games_users_questions', 'guq')
      .where('guq.user_id = :userId', { userId })
      .andWhere('game.status IN (:...statuses)', {
        statuses: [GameStatus.PENDING, GameStatus.ACTIVE],
      })
      .select('game.id')
      .getRawOne();

    return gameRow ? gameRow.game_id : null;
  }

  async findActiveGame(userId: string): Promise<Game | null> {
    const gameId = await this.findActiveGameId(userId);

    return this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.games_users_questions', 'guq')
      .innerJoinAndSelect('guq.user', 'user')
      .innerJoinAndSelect('guq.question', 'question')
      .where('game.id = :gameId', { gameId })
      .getOne();
  }

  async findGamesByUserId(userId: string): Promise<Game[] | null> {
    return this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.games_users_questions', 'guq')
      .innerJoinAndSelect('guq.user', 'user')
      .innerJoinAndSelect('guq.question', 'question')
      .where(
        'game.id IN (SELECT guq2.game_id FROM games_users_questions guq2 WHERE guq2.user_id = :userId)',
        { userId },
      )
      .getMany();
  }

  async findAllGames(): Promise<Game[] | null> {
    return this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.games_users_questions', 'guq')
      .innerJoinAndSelect('guq.user', 'user')
      .innerJoinAndSelect('guq.question', 'question')
      .getMany();
  }

  async getStats(query: PlayersQueryParams) {
    const page = query.pageNumber; // Page number
    const limit = query.pageSize; // Items per page
    const offset = (page - 1) * limit; // Calculate offset

    const sortings = [];

    // Valid sort columns to prevent SQL injection
    const validSortColumns = [
      'sumScore',
      'gamesCount',
      'avgScores',
      'winsCount',
      'lossesCount',
      'drawsCount',
    ];

    // Convert sorting array ["avgScores desc", "sumScore desc"] → "avgScores DESC, sumScore DESC"
    const additionalSorts = sortings
      .map((sorting) => {
        const [column, order] = sorting.split(' ');
        if (
          validSortColumns.includes(column) &&
          (order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC')
        ) {
          return `${column} ${order.toUpperCase()}`;
        }
        return null; // Ignore invalid sortings
      })
      .filter(Boolean) // Remove null values
      .join(', '); // Join with commas

    let orderByClause: string;
    const primarySort = `${query.sortBy} ${query.sortDirection}`;

    if (query.sortBy || additionalSorts) {
      orderByClause = `ORDER BY ${primarySort ? primarySort : ''}${primarySort && additionalSorts ? `, ` : ''}${additionalSorts}`;
    } else {
      orderByClause = 'ORDER BY avgScores DESC, sumScore DESC';
    }

    const result = await this.dataSource.query(
      `
      WITH temp_game_stats AS (
          SELECT 
              guq.game_id,
              u.login as userLogin,
              guq.user_id, 
              SUM(guq.points) + SUM(guq.bonus) AS total_score,  -- Adjusted sum calculation
              CASE
                  WHEN SUM(guq.points) + SUM(guq.bonus) > opponent.total_score THEN 1
                  WHEN SUM(guq.points) + SUM(guq.bonus) = opponent.total_score THEN 0
                  ELSE -1
              END AS result
          FROM games_users_questions guq
          JOIN users u ON guq.user_id = u.id
          LEFT JOIN (
              SELECT game_id, user_id, SUM(points) + SUM(bonus) AS total_score
              FROM games_users_questions
              GROUP BY game_id, user_id
          ) AS opponent 
          ON guq.game_id = opponent.game_id AND guq.user_id != opponent.user_id
          GROUP BY guq.game_id, guq.user_id, u.login, opponent.total_score
      )
      SELECT tgs.user_id AS "userId",
             tgs.userLogin AS "userLogin",
             SUM(tgs.total_score) AS "sumScore", 
             COUNT(tgs.game_id) AS "gamesCount",
             ROUND(AVG(tgs.total_score), 2) AS "avgScores",             
             SUM(CASE WHEN result = 1 THEN 1 ELSE 0 END) AS "winsCount",
             SUM(CASE WHEN result = -1 THEN 1 ELSE 0 END) AS "lossesCount",
             SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END) AS "drawsCount"
      FROM temp_game_stats tgs
      GROUP BY tgs.user_id, tgs.userLogin
      ${orderByClause ? `ORDER BY ${orderByClause}` : ''}
      LIMIT $1 OFFSET $2;;
    `,
      [limit, offset],
    );

    console.log(result);

    return result;
  }

  async findGameById(gameId: string): Promise<Game | null> {
    return this.gamesOrm
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.games_users_questions', 'guq')
      .innerJoinAndSelect('guq.user', 'user')
      .innerJoinAndSelect('guq.question', 'question')
      .where('game.id = :gameId', { gameId })
      .getOne();
  }

  async findPendingGame() {
    return this.gamesOrm
      .createQueryBuilder('game')
      .where('game.status = :status', { status: GameStatus.PENDING })
      .getOne();
  }

  async getQuestionsByGameId(gameId: string, userId: string) {
    const guqs = await this.gameUserQuestionsOrm
      .createQueryBuilder('guq')
      .innerJoinAndSelect('guq.question', 'question')
      .where('guq.game_id = :gameId', { gameId })
      .andWhere('guq.user_id = :userId', { userId })
      .andWhere('guq.points IS NULL')
      .getMany();

    if (guqs.length === 0) {
      return [];
    }

    return guqs.map((guq) => guq.question);
  }

  async recordAnswer(dto: RecordAnswerDto): Promise<void> {
    await this.gameUserQuestionsOrm
      .createQueryBuilder()
      .update()
      .set({
        answered_at: dto.addedAt,
        is_correct: dto.isCorrect,
        points: dto.points,
        bonus: dto.bonus,
      })
      .where('question_id = :questionId', { questionId: dto.questionId })
      .andWhere('user_id = :userId', { userId: dto.userId })
      .andWhere('game_id = :gameId', { gameId: dto.gameId })
      .execute();
  }

  async deleteAll() {
    const deleteResult = await this.gameUserQuestionsOrm.delete({});

    return deleteResult.affected > 0;
  }
}
