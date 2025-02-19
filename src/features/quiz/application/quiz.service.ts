import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';

@Injectable()
export class QuizService {
  constructor(private quizRepository: QuizRepository) {}

  async connect() {
    const activeGame = await this.quizRepository.findActiveGames();
  }

  async sendAnswer(dto: GameDto) {
    // return
  }
}
