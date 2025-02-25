import { Get, UseGuards, Controller } from '@nestjs/common';

import { QuizService } from '../application/quiz.service';
import { JwtAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { UserContextDto } from '../../accounts/dto/auth.dto';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';

@Controller('pair-game-quiz/users')
export class QuizUsersController {
  constructor(private quizService: QuizService) {}

  @Get('my-statistic')
  @UseGuards(JwtAuthGuard)
  async getGames(@ExtractUserFromRequest() user: UserContextDto) {
    return this.quizService.getMyStatistic(user.id);
  }
}
