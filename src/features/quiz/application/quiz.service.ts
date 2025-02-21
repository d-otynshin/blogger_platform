import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';
import { GameStatus } from '../domain/game.entity';
import { parseGameInfo } from '../lib/parseGameInfo';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import { ForbiddenDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class QuizService {
  constructor(private quizRepository: QuizRepository) {}

  async getActiveGame(userId: string) {
    const activeGame = await this.quizRepository.findActiveGame(userId);

    return parseGameInfo(activeGame);
  }

  async findGameById(gameId: string) {
    const activeGame = await this.quizRepository.findGameById(gameId);

    return parseGameInfo(activeGame);
  }

  async connect(userId: string) {
    const isPlaying = await this.quizRepository.isPlaying(userId);
    if (!isPlaying) {
      throw ForbiddenDomainException.create('User is already in a game.');
    }

    const pendingGame = await this.quizRepository.findPendingGame();

    if (!pendingGame) {
      const createdGame = await this.quizRepository.createGameInstance();

      await this.quizRepository.initGame({ userId, gameId: createdGame.id });

      return createdGame;
    }

    await this.quizRepository.addPlayer({ userId, gameId: pendingGame.id });

    await this.quizRepository.updateGameStatus(
      pendingGame.id,
      GameStatus.ACTIVE,
    );

    return pendingGame;
  }

  async sendAnswer(dto: GameDto, userId: string) {
    const activeGameId = await this.quizRepository.findActiveGameId(userId);
    if (!activeGameId) {
      throw ForbiddenDomainException.create('User is not in the game.');
    }

    // TODO: filter and get only questions
    const guqs = await this.quizRepository.getQuestionsByGameId(
      activeGameId,
      userId,
    );

    if (guqs.length === 0) {
      throw ForbiddenDomainException.create('All questions are answered.');
    }

    const guqToAnswer = guqs[0];

    const isCorrect = guqToAnswer.question.correct_answers.includes(dto.answer);

    await this.quizRepository.addAnswerToGame(
      userId,
      guqToAnswer.question.id,
      isCorrect,
    );

    return guqs;
  }
}
