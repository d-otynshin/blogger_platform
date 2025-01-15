import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandBus } from '@nestjs/cqrs';

import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/queries/blogs.query-repository';

import { Comment, CommentSchema } from './domain/comment.entity';
import { CommentsQueryRepository } from './infrastructure/queries/comments.query-repository';

import { Post, PostSchema } from './domain/post.entity';
import { PostsService } from './application/posts.service';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { PostsQueryRepository } from './infrastructure/queries/posts.query-repository';

import { AccountsModule } from '../accounts/accounts.module';
import { BasicAuthGuard } from '../accounts/guards/basic/basic-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AccountsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    BasicAuthGuard,
    CommandBus,
  ],
  exports: [MongooseModule],
})
export class PlatformModule {}
