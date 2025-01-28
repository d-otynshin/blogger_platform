import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersRepository } from '../accounts/infrastructure/repositories/users.repository';
import { SecurityRepository } from '../accounts/infrastructure/repositories/security.repository';
import { CommentsRepository } from '../platform/infrastructure/repositories/comments.repository';
import { BlogsRepository } from '../platform/infrastructure/repositories/blogs.repository';
import { PostsRepository } from '../platform/infrastructure/repositories/posts.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private securityRepository: SecurityRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await Promise.all([
      await this.usersRepository.deleteAll(),
      await this.securityRepository.deleteAll(),
      await this.blogsRepository.deleteAll(),
      await this.postsRepository.deleteAll(),
      await this.commentsRepository.deleteAll(),
    ]);
  }
}
