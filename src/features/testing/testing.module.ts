import { Module } from '@nestjs/common';

/* Modules */
import { QuizModule } from '../quiz/quiz.module';
import { AccountsModule } from '../accounts/accounts.module';
import { PlatformModule } from '../platform/platform.module';

/* Controllers */
import { TestingController } from './testing.controller';

/* Repositories */
import { GamesRepository } from '../quiz/infrastructure/repositories/games.repository';
import { BlogsRepository } from '../platform/infrastructure/repositories/blogs.repository';
import { UsersRepository } from '../accounts/infrastructure/repositories/users.repository';
import { PostsRepository } from '../platform/infrastructure/repositories/posts.repository';
import { CommentsRepository } from '../platform/infrastructure/repositories/comments.repository';
import { SecurityRepository } from '../accounts/infrastructure/repositories/security.repository';
import { QuestionsRepository } from '../quiz/infrastructure/repositories/qustions.repository';
import { InteractionsRepository } from '../platform/infrastructure/repositories/interactions.repository';
import { QuizRepository } from '../quiz/infrastructure/repositories/quiz.repository';

@Module({
  imports: [AccountsModule, PlatformModule, QuizModule],
  controllers: [TestingController],
  providers: [
    QuizRepository,
    GamesRepository,
    BlogsRepository,
    UsersRepository,
    PostsRepository,
    CommentsRepository,
    SecurityRepository,
    QuestionsRepository,
    InteractionsRepository,
  ],
})
export class TestingModule {}
