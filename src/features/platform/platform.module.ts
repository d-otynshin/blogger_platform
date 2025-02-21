import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

/* Constraints */
import { IsBlogExistConstraint } from './api/input-dto/helpers/validate-blog-id';

/* Modules */
import { AccountsModule } from '../accounts/accounts.module';

/* Guards */
import { BasicAuthGuard } from '../accounts/guards/basic/basic-auth.guard';

/* Controllers */
import { PostsController } from './api/posts.controller';
import { BlogsController } from './api/blogs.controller';
import { CommentsController } from './api/comments.controller';

/* Services */
import { BlogsService } from './application/blogs.service';
import { PostsService } from './application/posts.service';
import { CommentsService } from './application/comments.service';

/* Entities */
import { Blog } from './domain/blog.entity';
import { Post } from './domain/post.entity';
import { Comment } from './domain/comment.entity';
import { PostsInteraction } from './domain/posts-interaction.entity';
import { CommentsInteraction } from './domain/comments-interaction.entity';

/* Repositories */
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/queries/blogs.query-repository';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { PostsQueryRepository } from './infrastructure/queries/posts.query-repository';
import { CommentsRepository } from './infrastructure/repositories/comments.repository';
import { CommentsQueryRepository } from './infrastructure/queries/comments.query-repository';
import { InteractionsRepository } from './infrastructure/repositories/interactions.repository';

/* Use Cases */
import { CreateCommentUseCase } from './application/use-cases/comments/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/comments/delete-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/comments/update-comment.use-case';
import { UpdateLikePostUseCase } from './application/use-cases/posts/update-like-post.use-case';
import { CreateInteractionPostUseCase } from './application/use-cases/posts/create-interaction-post.use-case';
import { UpdateInteractionCommentUseCase } from './application/use-cases/comments/update-interaction-comment.use-case';
import { CreateInteractionCommentUseCase } from './application/use-cases/comments/create-interaction-comment.use-case';

@Module({
  imports: [
    AccountsModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      Blog,
      Post,
      Comment,
      PostsInteraction,
      CommentsInteraction,
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    /* Guards */
    BasicAuthGuard,

    /* Constraints */
    IsBlogExistConstraint,

    /* Services */
    BlogsService,
    CommentsService,
    PostsService,

    /* Repositories */
    CommentsRepository,
    CommentsQueryRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    InteractionsRepository,

    /* Use Cases */
    DeleteCommentUseCase,
    UpdateCommentUseCase,
    CreateCommentUseCase,
    CreateInteractionCommentUseCase,
    UpdateInteractionCommentUseCase,
    UpdateLikePostUseCase,
    CreateInteractionPostUseCase,
  ],
  exports: [
    TypeOrmModule,
    // TODO: check if I need them all
    PostsRepository,
    BlogsRepository,
    CommentsRepository,
    InteractionsRepository,
  ],
})
export class PlatformModule {}
