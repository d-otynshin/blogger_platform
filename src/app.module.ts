import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AccountsModule } from './features/accounts/accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformModule } from './features/platform/platform.module';

// TODO: refactor and remove
import { User } from './features/accounts/domain/user.entity';
import { Blog } from './features/platform/domain/blog.entity';
import { Post } from './features/platform/domain/post.entity';
import { Comment } from './features/platform/domain/comment.entity';
import { PostsInteraction } from './features/platform/domain/posts-interaction.entity';
import { CommentsInteraction } from './features/platform/domain/comments-interaction.entity';
import { Session } from './features/accounts/domain/session.entity';
// import { ThrottlerModule } from '@nestjs/throttler';
import { QuizModule } from './features/quiz/quiz.module';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true, // TODO: remove for prod.
      url: process.env.DB_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [
        User,
        Post,
        Blog,
        Post,
        Comment,
        Session,
        PostsInteraction,
        CommentsInteraction,
      ],
    }),
    TestingModule,
    AccountsModule,
    PlatformModule,
    NotificationsModule,
    QuizModule,
    // ThrottlerModule.forRoot([{ ttl: 10000, limit: 5 }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
