import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AccountsModule } from './features/accounts/accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { PlatformModule } from './features/platform/platform.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({}),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    AccountsModule,
    TestingModule,
    PlatformModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
