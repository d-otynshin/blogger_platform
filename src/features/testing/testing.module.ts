import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  controllers: [TestingController],
})
export class TestingModule {}
