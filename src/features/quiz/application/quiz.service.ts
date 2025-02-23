import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';
import { GameStatus } from '../domain/game.entity';
import { parseGameInfo } from '../lib/parseGameInfo';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException
} from '../../../core/exceptions/domain-exceptions';
import { isUUID } from 'class-validator';

@Injectable()
export class QuizService {
  constructor(private quizRepository: QuizRepository) {}

  async getActiveGame(userId: string) {
    const activeGame = await this.quizRepository.findActiveGame(userId);
    if (!activeGame) throw NotFoundDomainException.create('Game not found');

    console.log('MY CURRENT GAME', activeGame);

    return parseGameInfo(activeGame);
  }

  async findGameById(gameId: number, userId: string) {
    // TODO: move logic, or change it
    if (
      !(
        typeof gameId === 'number' ||
        (!isNaN(gameId) && !isNaN(parseFloat(gameId))) ||
        isUUID(gameId)
      )
    ) {
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

    return parseGameInfo(activeGame);
  }

  async connect(userId: string) {
    const isPlaying = await this.quizRepository.isPlaying(userId);
    if (isPlaying) {
      throw ForbiddenDomainException.create('User is already in a game.');
    }

    const pendingGame = await this.quizRepository.findPendingGame();
    console.log('pendingGame', pendingGame);

    if (!pendingGame) {
      const createdGame = await this.quizRepository.createGameInstance();
      console.log('createdGame', createdGame);

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
    const guqs = await this.quizRepository.getQuestionsByGameId(
      activeGame.id,
      userId,
    );

    if (guqs.length === 0) {
      throw ForbiddenDomainException.create('All questions are answered.');
    }

    const guqToAnswer = guqs[0];

    const isCorrect = guqToAnswer.question.correct_answers.includes(dto.answer);

    const addedAt = new Date();

    if (guqs.length === 1) {
      const parsedGame = parseGameInfo(activeGame);

      const opponentPlayerId: string =
        userId === parsedGame.firstPlayerProgress.player.id
          ? parsedGame.secondPlayerProgress.player.id
          : parsedGame.firstPlayerProgress.player.id;

      const opponentGUQs = await this.quizRepository.getQuestionsByGameId(
        activeGame.id,
        opponentPlayerId,
      );

      let points: number;

      if (opponentGUQs.length !== 0) {
        // check bonus
        const currentScore: number =
          userId === parsedGame.firstPlayerProgress.player.id
            ? parsedGame.firstPlayerProgress.score
            : parsedGame.secondPlayerProgress.score;

        points = currentScore > 0 ? 2 : 1;

        await this.quizRepository.addAnswerToGame(
          userId,
          guqToAnswer.question.id,
          isCorrect ? points : 0,
          addedAt,
        );
      }

      if (opponentGUQs.length === 0) {
        // finish game
        points = 1;

        await this.quizRepository.addAnswerToGame(
          userId,
          guqToAnswer.question.id,
          isCorrect ? points : 0,
          addedAt,
        );

        await this.quizRepository.updateGameStatus(
          activeGame.id,
          GameStatus.FINISHED,
        );
      }

      return;
    }

    await this.quizRepository.addAnswerToGame(
      userId,
      guqToAnswer.question.id,
      isCorrect ? 1 : 0,
      addedAt,
    );

    return {
      questionId: guqToAnswer.question.id,
      answerStatus: isCorrect ? 'Correct' : 'Incorrect',
      addedAt,
    };
  }
}
