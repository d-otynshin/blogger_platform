import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersSQLRepository } from '../accounts/infrastructure/repositories/users-sql.repository';
import { SecurityPostgresqlRepository } from '../accounts/infrastructure/repositories/security-postgresql.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private usersRepository: UsersSQLRepository,
    private securityRepository: SecurityPostgresqlRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await Promise.all([
      await this.usersRepository.deleteAll(),
      await this.securityRepository.deleteAll(),
      // await this.UserModel.deleteMany(),
      // await this.BlogModel.deleteMany(),
      // await this.PostModel.deleteMany(),
      // await this.CommentModel.deleteMany(),
    ]);
  }
}
