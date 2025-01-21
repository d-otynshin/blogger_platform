import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AccountsModule } from './features/accounts/accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ThrottlerModule } from '@nestjs/throttler';
// import { PlatformModule } from './features/platform/platform.module';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true, // TODO: remove for prod.
      url: process.env.DB_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AccountsModule,
    TestingModule,
    NotificationsModule,
    // PlatformModule,
    // ThrottlerModule.forRoot([{ ttl: 10000, limit: 5 }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
