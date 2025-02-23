import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/* Repositories */
import { GamesRepository } from './infrastructure/repositories/games.repository';
import { QuizRepository } from './infrastructure/repositories/quiz.repository';
import { QuestionsRepository } from './infrastructure/repositories/qustions.repository';
import { QuestionsQueryRepository } from './infrastructure/queries/questions-query.repository';

/* Controllers */
import { QuizAdminController } from './api/quiz-admin.controller';
import { PairGameQuizController } from './api/pair-game-quiz.controller';

/* Services */
import { QuizService } from './application/quiz.service';
import { QuestionsService } from './application/questions.service';

/* Entities */
import { Game } from './domain/game.entity';
import { Question } from './domain/question.entity';
import { GameUserQuestion } from './domain/game-user-queston.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Game, GameUserQuestion])],
  controllers: [QuizAdminController, PairGameQuizController],
  providers: [
    QuizService,
    QuestionsService,
    QuizRepository,
    GamesRepository,
    QuestionsRepository,
    QuestionsQueryRepository,
  ],
  exports: [
    TypeOrmModule,
    QuizRepository,
    GamesRepository,
    QuestionsRepository,
  ],
})
export class QuizModule {}
