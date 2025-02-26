import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
// import { ThrottlerModule } from '@nestjs/throttler';

import { AppService } from './app.service';
import { AppController } from './app.controller';

/* Modules */
import { QuizModule } from './features/quiz/quiz.module';
import { TestingModule } from './features/testing/testing.module';
import { PlatformModule } from './features/platform/platform.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { NotificationsModule } from './features/notifications/notifications.module';

// TODO: refactor and remove
/* Entities */
import { Game } from './features/quiz/domain/game.entity';
import { User } from './features/accounts/domain/user.entity';
import { Blog } from './features/platform/domain/blog.entity';
import { Post } from './features/platform/domain/post.entity';
import { Comment } from './features/platform/domain/comment.entity';
import { Session } from './features/accounts/domain/session.entity';
import { Question } from './features/quiz/domain/question.entity';
import { PostsInteraction } from './features/platform/domain/posts-interaction.entity';
import { CommentsInteraction } from './features/platform/domain/comments-interaction.entity';
import { GameUserQuestion } from './features/quiz/domain/game-user-queston.entity';

@Module({
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true, // TODO: remove for prod.
      url: process.env.DB_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [
        Game,
        User,
        Post,
        Blog,
        Post,
        Comment,
        Session,
        Question,
        GameUserQuestion,
        PostsInteraction,
        CommentsInteraction,
      ],
    }),
    QuizModule,
    TestingModule,
    AccountsModule,
    PlatformModule,
    NotificationsModule,
    // ThrottlerModule.forRoot([{ ttl: 10000, limit: 5 }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
