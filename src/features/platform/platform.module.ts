import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';
import { BlogsController } from './api/blogs.controller';
import { Blog, BlogSchema } from './domain/blog.entity';
import { PostsController } from './api/posts.controller';
import { BlogsQueryRepository } from './infrastructure/queries/blogs.query-repository';
import { PostsService } from './application/posts.service';
import { PostsQueryRepository } from './infrastructure/queries/posts.query-repository';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { Post, PostSchema } from './domain/post.entity';
import { Comment, CommentSchema } from './domain/comment.entity';
import { CommentsQueryRepository } from './infrastructure/queries/comments.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsQueryRepository,
    CommentsQueryRepository,
    PostsRepository,
  ],
  exports: [MongooseModule],
})
export class PlatformModule {}
