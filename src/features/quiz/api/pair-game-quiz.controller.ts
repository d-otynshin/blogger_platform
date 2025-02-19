import { Get, Post, Body, Param, UseGuards, Controller } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GameDto } from '../dto/game.dto';
import { QuizService } from '../application/quiz.service';
import { GamesRepository } from '../infrastructure/repositories/games.repository';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import {
  UserContextDto,
  ExtractUserFromRequest,
} from '../../../core/decorators/extract-user-from-request';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizRepository: QuizRepository,
    private readonly gamesRepository: GamesRepository,
  ) {}

  @Get('my-current')
  @UseGuards(AuthGuard)
  async getCurrentGame(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizRepository.findCurrentGame(user.id);
  }

  @Get(':id')
  async getGameById(@Param('id') gameId: number) {
    return this.gamesRepository.findById(gameId);
  }

  @Post('connection')
  async connect() {
    return this.quizService.connect();
  }

  @Post('my-current/answers')
  async sendAnswer(@Body() dto: GameDto) {
    return this.quizService.sendAnswer(dto);
  }
}
