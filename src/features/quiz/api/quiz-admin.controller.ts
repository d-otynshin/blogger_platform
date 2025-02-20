import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { GetQuestionsQueryParams } from './helpers';
import { CreateQuestionDto } from '../dto/question.dto';
import { QuestionsService } from '../application/questions.service';
import { QuestionsQueryRepository } from '../infrastructure/queries/questions-query.repository';

@Controller('quiz/sa')
export class QuizAdminController {
  constructor(
    private questionsService: QuestionsService,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}
  @Get('questions')
  async findAll(@Query() query: GetQuestionsQueryParams) {
    return this.questionsQueryRepository.findAll(query);
  }

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
  @Put('questions/:id/publish')
  async publishQuestion(@Param('id') id: string) {
    return this.questionsService.publishQuestion(id);
  }
}
