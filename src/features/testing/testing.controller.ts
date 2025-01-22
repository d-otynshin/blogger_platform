import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersSQLRepository } from '../accounts/infrastructure/repositories/users-sql.repository';
import { SecurityPostgresqlRepository } from '../accounts/infrastructure/repositories/security-postgresql.repository';
import { CommentsSQLRepository } from '../platform/infrastructure/repositories/comments-sql.repository';
import { BlogsSQLRepository } from '../platform/infrastructure/repositories/blogs-sql.repository';
import { PostsSQLRepository } from '../platform/infrastructure/repositories/posts-sql.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private usersRepository: UsersSQLRepository,
    private blogsRepository: BlogsSQLRepository,
    private postsRepository: PostsSQLRepository,
    private commentsRepository: CommentsSQLRepository,
    private securityRepository: SecurityPostgresqlRepository,
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
