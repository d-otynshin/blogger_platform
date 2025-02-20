import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { QuestionsService } from './application/questions.service';
import { QuizAdminController } from './api/quiz-admin.controller';
import { QuestionsQueryRepository } from './infrastructure/queries/questions-query.repository';
import { QuestionsRepository } from './infrastructure/repositories/qustions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [QuizAdminController],
  providers: [QuestionsService, QuestionsRepository, QuestionsQueryRepository],
})
export class QuizModule {}
