import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './features/accounts/accounts.module';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [
    // TODO: add env. var
    MongooseModule.forRoot('mongodb://localhost/nest-blogger-platform'),
    AccountsModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
