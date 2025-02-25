import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersRepository } from '../accounts/infrastructure/repositories/users.repository';
import { SecurityRepository } from '../accounts/infrastructure/repositories/security.repository';
import { CommentsRepository } from '../platform/infrastructure/repositories/comments.repository';
import { BlogsRepository } from '../platform/infrastructure/repositories/blogs.repository';
import { PostsRepository } from '../platform/infrastructure/repositories/posts.repository';
import { QuestionsRepository } from '../quiz/infrastructure/repositories/qustions.repository';
import { GamesRepository } from '../quiz/infrastructure/repositories/games.repository';
import { QuizRepository } from '../quiz/infrastructure/repositories/quiz.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private quizRepository: QuizRepository,
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private gamesRepository: GamesRepository,
    private commentsRepository: CommentsRepository,
    private securityRepository: SecurityRepository,
    private questionsRepository: QuestionsRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await Promise.all([
      await this.usersRepository.deleteAll(),
      await this.blogsRepository.deleteAll(),
      await this.postsRepository.deleteAll(),
      await this.gamesRepository.deleteAll(),
      await this.quizRepository.deleteAll(),
      await this.securityRepository.deleteAll(),
      await this.commentsRepository.deleteAll(),
      await this.questionsRepository.deleteAll(),
    ]);
  }
}
