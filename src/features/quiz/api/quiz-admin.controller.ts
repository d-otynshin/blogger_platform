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
  UseGuards,
} from '@nestjs/common';

import { GetQuestionsQueryParams } from '../lib/helpers';
import { CreateQuestionDto, PublishQuestionDto } from '../dto/question.dto';
import { QuestionsService } from '../application/questions.service';
import { QuestionsQueryRepository } from '../infrastructure/queries/questions-query.repository';
import { QuestionViewDto } from '../dto/question-view.dto';
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';

@Controller('sa/quiz')
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
  @UseGuards(BasicAuthGuard)
  async createQuestion(@Body() dto: CreateQuestionDto) {
    const createdQuestion = await this.questionsService.createQuestion(dto);
    return QuestionViewDto.mapToView(createdQuestion);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.updateQuestion(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id/publish')
  async publishQuestion(
    @Param('id') id: string,
    @Body() dto: PublishQuestionDto,
  ) {
    return this.questionsService.publishQuestion(id, dto);
  }
}
