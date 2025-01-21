import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersPostgresqlRepository } from '../accounts/infrastructure/repositories/users-postgresql.repository';

@Controller('testing')
export class TestingController {
  constructor(private usersRepository: UsersPostgresqlRepository) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await Promise.all([
      await this.usersRepository.deleteAll(),
      // await this.UserModel.deleteMany(),
      // await this.BlogModel.deleteMany(),
      // await this.PostModel.deleteMany(),
      // await this.CommentModel.deleteMany(),
    ]);
  }
}
