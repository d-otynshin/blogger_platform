import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersSQLRepository } from '../accounts/infrastructure/repositories/users-sql.repository';
import { SecurityPostgresqlRepository } from '../accounts/infrastructure/repositories/security-postgresql.repository';
// import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [AccountsModule], // PlatformModule
  controllers: [TestingController],
  providers: [UsersSQLRepository, SecurityPostgresqlRepository],
})
export class TestingModule {}
