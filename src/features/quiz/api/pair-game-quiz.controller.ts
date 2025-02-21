import { Post, Controller, UseGuards, Get, Param, Body } from '@nestjs/common';

import { GameDto } from '../dto/game.dto';
import { QuizService } from '../application/quiz.service';
import { JwtAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { UserContextDto } from '../../accounts/dto/auth.dto';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentGame(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizService.getActiveGame(user.id);
  }

  @Get(':id')
  async getGameById(@Param('id') gameId: string) {
    return this.quizService.findGameById(gameId);
  }

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  async connect(@ExtractUserFromRequest() user: UserContextDto) {
    console.log('CONNECTION user:', user);
    return this.quizService.connect(user.id);
  }

  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  async sendAnswer(
    @Body() dto: GameDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.quizService.sendAnswer(dto, user.id);
  }
}
