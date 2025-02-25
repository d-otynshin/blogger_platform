import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';
import { GameStatus } from '../domain/game.entity';
import { parseGameInfo } from '../lib/parseGameInfo';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { GameViewDto } from '../dto/game-view.dto';
import { calculateGameStats } from '../lib/calculate-game-stats';
import { PlayersQueryParams } from '../lib/helpers';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class QuizService {
  constructor(private quizRepository: QuizRepository) {}

  async getActiveGame(userId: string) {
    const activeGame = await this.quizRepository.findActiveGame(userId);
    if (!activeGame) throw NotFoundDomainException.create('Game not found');

    console.log('MY CURRENT GAME', parseGameInfo(activeGame));

    return parseGameInfo(activeGame);
  }

  async getMyGames(userId: string) {
    const games = await this.quizRepository.findGamesByUserId(userId);
    if (!games) throw NotFoundDomainException.create('Games not found');

    console.log('MY ALL GAMES', games.map(GameViewDto.mapToView));

    return games.map(GameViewDto.mapToView);
  }

  async getAllGames() {
    const games = await this.quizRepository.findAllGames();
    if (!games) throw NotFoundDomainException.create('Games not found');

    console.log('ALL GAMES', games.map(GameViewDto.mapToView));

    return games.map(GameViewDto.mapToView);
  }

  async getMyStats(userId: string) {
    const games = await this.getMyGames(userId);

    console.log('MY STATS', calculateGameStats(games, userId));

    return calculateGameStats(games, userId);
  }

  async getPlayersStats(query: PlayersQueryParams) {
    // const games = await this.getAllGames();

    console.log('QUERY', query);

    const stats = await this.quizRepository.getStats(query);

    console.log('PLAYERS STATS', stats);

    return stats;
  }

  async findGameById(gameId: string, userId: string) {
    // TODO: move logic, or change it
    if (uuidRegex.test(String(gameId))) {
      throw NotFoundDomainException.create('Invalid game id');
    }

    if (!Number(gameId)) {
      throw BadRequestDomainException.create('Invalid game id');
    }

    const activeGame = await this.quizRepository.findGameById(gameId);

    const isParticipating = activeGame.games_users_questions.some(
      (entry) => entry.user.id === userId,
    );

    if (!isParticipating) {
      throw ForbiddenDomainException.create(
        'User is not participating in this game.',
      );
    }

    console.log('GAME BY ID', parseGameInfo(activeGame));

    return parseGameInfo(activeGame);
  }

  async connect(userId: string) {
    const isPlaying = await this.quizRepository.isPlaying(userId);
    if (isPlaying) {
      console.log('USER IS ALREADY PLAYING', userId);
      throw ForbiddenDomainException.create('User is already in a game.');
    }

    const pendingGame = await this.quizRepository.findPendingGame();

    if (!pendingGame) {
      const createdGame = await this.quizRepository.createGameInstance();

      await this.quizRepository.initGame({ userId, gameId: createdGame.id });

      const game = await this.quizRepository.findGameById(createdGame.id);

      console.log('CREATED GAME VIEW', parseGameInfo(game));

      return parseGameInfo(game);
    }

    await this.quizRepository.addPlayer({ userId, gameId: pendingGame.id });

    await this.quizRepository.updateGameStatus(
      pendingGame.id,
      GameStatus.ACTIVE,
    );

    const game = await this.quizRepository.findGameById(pendingGame.id);

    console.log('PENDING GAME VIEW', parseGameInfo(game));

    return parseGameInfo(game);
  }

  async sendAnswer(dto: GameDto, userId: string) {
    const activeGame = await this.quizRepository.findActiveGame(userId);
    if (!activeGame) {
      throw ForbiddenDomainException.create('User is not in the game.');
    }

    if (activeGame.status !== GameStatus.ACTIVE) {
      throw ForbiddenDomainException.create('User is not in active game.');
    }

    // TODO: filter and get only questions
    const questions = await this.quizRepository.getQuestionsByGameId(
      activeGame.id,
      userId,
    );

    if (questions.length === 0) {
      throw ForbiddenDomainException.create('All questions are answered.');
    }

    const questionToAnswer = questions.sort(
      (qnA: any, qnB: any) => qnA.created_at - qnB.created_at,
    )[0];

    const isCorrect = questionToAnswer.correct_answers.includes(dto.answer);

    console.log('GAME_ID', activeGame.id);
    console.log('IS_CORRECT', isCorrect);
    console.log('USER_ID', userId);
    console.log('QUESTION_ID', questionToAnswer.id);
    console.log('CORRECT_ANSWERS', questionToAnswer.correct_answers);
    console.log('USER_ANSWER', dto.answer);
    console.log('------------------------');
    const addedAt = new Date();

    console.log('QNS_LENGTH', questions.length);
    console.log('ADDED_AT', addedAt);

    if (questions.length === 1) {
      const parsedGame = parseGameInfo(activeGame);

      const opponentPlayerId: string =
        userId === parsedGame.firstPlayerProgress.player.id
          ? parsedGame.secondPlayerProgress.player.id
          : parsedGame.firstPlayerProgress.player.id;

      const opponentQNs = await this.quizRepository.getQuestionsByGameId(
        activeGame.id,
        opponentPlayerId,
      );

      console.log('OPPONENTS QNS LENGTH', opponentQNs.length, opponentPlayerId);

      if (opponentQNs.length !== 0) {
        // check bonus
        const currentScore: number =
          userId === parsedGame.firstPlayerProgress.player.id
            ? parsedGame.firstPlayerProgress.score
            : parsedGame.secondPlayerProgress.score;

        const hasBonus = currentScore > 0;

        await this.quizRepository.recordAnswer({
          userId: userId,
          gameId: activeGame.id,
          questionId: questionToAnswer.id,
          addedAt: addedAt,
          isCorrect: isCorrect,
          bonus: hasBonus ? 1 : 0,
          points: isCorrect ? 1 : 0,
        });
      }

      if (opponentQNs.length === 0) {
        // finish game
        await this.quizRepository.recordAnswer({
          userId: userId,
          gameId: activeGame.id,
          questionId: questionToAnswer.id,
          isCorrect: isCorrect,
          addedAt: addedAt,
          bonus: 0,
          points: isCorrect ? 1 : 0,
        });

        await this.quizRepository.finishGame(activeGame.id);
      }

      return {
        questionId: questionToAnswer.id,
        answerStatus: isCorrect ? 'Correct' : 'Incorrect',
        addedAt: addedAt.toISOString(),
      };
    }

    console.log('POINTS', isCorrect ? 1 : 0);

    await this.quizRepository.recordAnswer({
      gameId: activeGame.id,
      userId: userId,
      questionId: questionToAnswer.id,
      isCorrect: isCorrect,
      addedAt: addedAt,
      bonus: 0,
      points: isCorrect ? 1 : 0,
    });

    return {
      questionId: questionToAnswer.id,
      answerStatus: isCorrect ? 'Correct' : 'Incorrect',
      addedAt: addedAt.toISOString(),
    };
  }
}
