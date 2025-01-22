import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersSQLRepository } from '../accounts/infrastructure/repositories/users-sql.repository';
import { SecurityPostgresqlRepository } from '../accounts/infrastructure/repositories/security-postgresql.repository';
import { PlatformModule } from '../platform/platform.module';
import { BlogsSQLRepository } from '../platform/infrastructure/repositories/blogs-sql.repository';
import { CommentsSQLRepository } from '../platform/infrastructure/repositories/comments-sql.repository';
import { PostsSQLRepository } from '../platform/infrastructure/repositories/posts-sql.repository';

@Module({
  imports: [AccountsModule, PlatformModule],
  controllers: [TestingController],
  providers: [
    UsersSQLRepository,
    PostsSQLRepository,
    BlogsSQLRepository,
    CommentsSQLRepository,
    SecurityPostgresqlRepository,
  ],
})
export class TestingModule {}
