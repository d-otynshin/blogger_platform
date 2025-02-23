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

  async findGameById(gameId: string, userId: string) {
    // TODO: move logic, or change it
    if (uuidRegex.test(String(gameId))) {
      throw NotFoundDomainException.create('Invalid game id');
    }

    if (!Number(gameId)) {
      throw BadRequestDomainException.create('Invalid game id');
    }

    const activeGame = await this.quizRepository.findGameById(Number(gameId));

    const isParticipating = activeGame.games_users_questions.some(
      (entry) => entry.user.id === userId,
    );

    if (!isParticipating) {
      throw ForbiddenDomainException.create(
        'User is not participating in this game.',
      );
    }

    return parseGameInfo(activeGame);
  }

  async connect(userId: string) {
    const isPlaying = await this.quizRepository.isPlaying(userId);
    if (isPlaying) {
      console.log('CONNECT USER_ID', userId);
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

    const addedAt = new Date();

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

      let points: number;

      if (opponentQNs.length !== 0) {
        // check bonus
        const currentScore: number =
          userId === parsedGame.firstPlayerProgress.player.id
            ? parsedGame.firstPlayerProgress.score
            : parsedGame.secondPlayerProgress.score;

        console.log('currentScore', currentScore);
        console.log('opponentQNs.length', opponentQNs.length);

        points = currentScore > 0 ? 2 : 1;

        console.log('POINTS', points);

        await this.quizRepository.addAnswerToGame(
          userId,
          questionToAnswer.id,
          isCorrect ? points : 0,
          addedAt,
        );
      }

      if (opponentQNs.length === 0) {
        // finish game
        points = 1;

        await this.quizRepository.addAnswerToGame(
          userId,
          questionToAnswer.id,
          isCorrect ? points : 0,
          addedAt,
        );

        await this.quizRepository.finsihGame(activeGame.id);
      }

      return {
        questionId: questionToAnswer.id,
        answerStatus: isCorrect ? 'Correct' : 'Incorrect',
        addedAt: addedAt.toISOString(),
      };
    }

    await this.quizRepository.addAnswerToGame(
      userId,
      questionToAnswer.id,
      isCorrect ? 1 : 0,
      addedAt,
    );

    const log = {
      questionId: questionToAnswer.id,
      answerStatus: isCorrect ? 'Correct' : 'Incorrect',
      addedAt: addedAt.toISOString(),
    };

    return {
      questionId: questionToAnswer.id,
      answerStatus: isCorrect ? 'Correct' : 'Incorrect',
      addedAt: addedAt.toISOString(),
    };
  }
}
