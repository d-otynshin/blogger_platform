import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [AccountsModule, PlatformModule],
  controllers: [TestingController],
})
export class TestingModule {}
