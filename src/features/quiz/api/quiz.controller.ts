import {
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { CreateQuestionDto } from '../dto/question.dto';
import { QuestionsService } from '../application/questions.service';

@Controller('quiz')
export class QuizController {
  constructor(private questionsService: QuestionsService) {}
  // @Get('sa/questions')
  // async findAll() {
  //
  // }

  @HttpCode(HttpStatus.CREATED)
  @Post('questions')
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.updateQuestion(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('questions/:id')
  async publishQuestion(@Param('id') id: string) {
    return this.questionsService.publishQuestion(id);
  }
}
