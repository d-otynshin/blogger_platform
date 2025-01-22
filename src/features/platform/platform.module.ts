import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

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

/* Repositories */
import { BlogsSQLRepository } from './infrastructure/repositories/blogs-sql.repository';
import { BlogsSQLQueryRepository } from './infrastructure/queries/blogs-sql.query-repository';
import { PostsSQLRepository } from './infrastructure/repositories/posts-sql.repository';
import { PostsSQLQueryRepository } from './infrastructure/queries/posts-sql.query-repository';
import { CommentsQueryRepository } from './infrastructure/queries/comments.query-repository';

/* Use Cases */
import { CreateCommentUseCase } from './application/use-cases/comments/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/comments/delete-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/comments/update-comment.use-case';
import { UpdateLikePostUseCase } from './application/use-cases/posts/update-like-post.use-case';
import { CreateInteractionPostUseCase } from './application/use-cases/posts/create-interaction-post.use-case';
import { UpdateInteractionCommentUseCase } from './application/use-cases/comments/update-interaction-comment.use-case';
import { CreateInteractionCommentUseCase } from './application/use-cases/comments/create-interaction-comment.use-case';
import { CommentsSQLRepository } from './infrastructure/repositories/comments-sql.repository';

@Module({
  imports: [AccountsModule, CqrsModule],
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
    CommentsSQLRepository,
    CommentsQueryRepository,
    BlogsSQLRepository,
    BlogsSQLQueryRepository,
    PostsSQLRepository,
    PostsSQLQueryRepository,

    /* Use Cases */
    DeleteCommentUseCase,
    UpdateCommentUseCase,
    CreateCommentUseCase,
    CreateInteractionCommentUseCase,
    UpdateInteractionCommentUseCase,
    UpdateLikePostUseCase,
    CreateInteractionPostUseCase,
  ],
  exports: [],
})
export class PlatformModule {}
