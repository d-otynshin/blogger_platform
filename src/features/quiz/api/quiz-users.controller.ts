import { Get, UseGuards, Controller, Query } from '@nestjs/common';

import { QuizService } from '../application/quiz.service';
import { JwtAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { UserContextDto } from '../../accounts/dto/auth.dto';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { PlayersQueryParams } from '../lib/helpers';

@Controller('pair-game-quiz/users')
export class QuizUsersController {
  constructor(private quizService: QuizService) {}

  @Get('my-statistic')
  @UseGuards(JwtAuthGuard)
  async getGames(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizService.getMyStats(user.id);
  }

  @Get('top')
  async getPlayers(@Query() query: PlayersQueryParams) {
    return this.quizService.getPlayersStats(query);
  }
}
