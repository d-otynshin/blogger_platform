import { Module } from '@nestjs/common';

/* Modules */
import { QuizModule } from '../quiz/quiz.module';
import { AccountsModule } from '../accounts/accounts.module';
import { PlatformModule } from '../platform/platform.module';

/* Controllers */
import { TestingController } from './testing.controller';

/* Repositories */
import { BlogsRepository } from '../platform/infrastructure/repositories/blogs.repository';
import { UsersRepository } from '../accounts/infrastructure/repositories/users.repository';
import { PostsRepository } from '../platform/infrastructure/repositories/posts.repository';
import { CommentsRepository } from '../platform/infrastructure/repositories/comments.repository';
import { SecurityRepository } from '../accounts/infrastructure/repositories/security.repository';
import { QuestionsRepository } from '../quiz/infrastructure/repositories/qustions.repository';
import { InteractionsRepository } from '../platform/infrastructure/repositories/interactions.repository';

@Module({
  imports: [AccountsModule, PlatformModule, QuizModule],
  controllers: [TestingController],
  providers: [
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
