import {
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus, Query
} from '@nestjs/common';

import { GameDto } from '../dto/game.dto';
import { QuizService } from '../application/quiz.service';
import { JwtAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { UserContextDto } from '../../accounts/dto/auth.dto';
import { GamesQueryRepository } from '../infrastructure/queries/games-query.repository';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { GetGamesQueryParams } from '../lib/helpers';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private quizService: QuizService,
    private gamesQueryRepository: GamesQueryRepository,
  ) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getGames(
    @ExtractUserFromRequest() user: UserContextDto,
    @Query() query: GetGamesQueryParams,
  ) {
    return this.gamesQueryRepository.findAll(query, user.id);
  }

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentGame(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizService.getActiveGame(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameById(
    @Param('id') gameId: string,
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
