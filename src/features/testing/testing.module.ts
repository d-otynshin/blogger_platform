import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersRepository } from '../accounts/infrastructure/repositories/users.repository';
import { PlatformModule } from '../platform/platform.module';
import { SecurityRepository } from '../accounts/infrastructure/repositories/security.repository';
// import { BlogsRepository } from '../platform/infrastructure/repositories/blogs.repository';
// import { PostsRepository } from '../platform/infrastructure/repositories/posts.repository';
// import { CommentsRepository } from '../platform/infrastructure/repositories/comments.repository';
// import { InteractionsRepository } from '../platform/infrastructure/repositories/interactions.repository';

@Module({
  imports: [AccountsModule, PlatformModule],
  controllers: [TestingController],
  providers: [
    UsersRepository,
    // BlogsRepository,
    // PostsRepository,
    // CommentsRepository,
    SecurityRepository,
    // InteractionsRepository,
  ],
})
export class TestingModule {}
