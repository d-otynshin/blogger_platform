import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersPostgresqlRepository } from '../accounts/infrastructure/repositories/users-postgresql.repository';
// import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [AccountsModule], // PlatformModule
  controllers: [TestingController],
  // TODO: should i provide?
  providers: [UsersPostgresqlRepository],
})
export class TestingModule {}
