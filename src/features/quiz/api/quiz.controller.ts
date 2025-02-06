import { Controller, Get } from '@nestjs/common';

@Controller('quiz')
export class QuizController {
  @Get('sa/questions')
  async findAll() {

  }
}
