import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/game.entity';
import { GameUserQuestion } from '../../domain/game-user-queston.entity';
import { Question } from '../../domain/question.entity';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Game)
    private gamesOrm: Repository<Game>,

    @InjectRepository(Question)
    private questionsOrm: Repository<Question>,

    @InjectRepository(GameUserQuestion)
    private gameUserQuestionsOrm: Repository<GameUserQuestion>,
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

  async addPlayer({ gameId, userId }) {
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

    if (gameQuestions.length === 0)
      throw NotFoundDomainException.create('No questions found for this game');

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
    return await this.gameUserQuestionsOrm
      .createQueryBuilder('guq')
      .innerJoinAndSelect('guq.question', 'question')
      .where('guq.game_id = :gameId', { gameId })
      .where('guq.user_id = :userId', { userId })
      .andWhere('guq.is_correct IS NULL')
      .getMany();
  }

  async addAnswerToGame(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    addedAt: Date,
  ): Promise<void> {
    await this.gameUserQuestionsOrm
      .createQueryBuilder()
      .update()
      .set({ answered_at: addedAt, is_correct: isCorrect })
      .where('question_id = :questionId', { questionId })
      .andWhere('user_id = :userId', { userId })
      .execute();
  }

  async deleteAll() {
    const deleteResult = await this.gamesOrm.delete({});

    return deleteResult.affected > 0;
  }
}
