import {
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

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
  @UseGuards(JwtAuthGuard)
  async getGameById(
    @Param('id') gameId: number,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.quizService.findGameById(gameId, user.id);
  }

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async connect(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizService.connect(user.id);
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async sendAnswer(
    @Body() dto: GameDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.quizService.sendAnswer(dto, user.id);
  }
}
