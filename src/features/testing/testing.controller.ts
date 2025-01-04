import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../accounts/domain/user.entity';
import { Blog, BlogModelType } from '../platform/domain/blog.entity';
import { Post, PostModelType } from '../platform/domain/post.entity';
import { Comment, CommentModelType } from '../platform/domain/comment.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await Promise.all([
      await this.UserModel.deleteMany(),
      await this.BlogModel.deleteMany(),
      await this.PostModel.deleteMany(),
      await this.CommentModel.deleteMany(),
    ]);
  }
}
