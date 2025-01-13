import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { AuthController } from './api/auth.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoService } from './application/crypto.service';
import { EmailService } from '../notifications/application/email.service';
import { AuthService } from './application/auth.service';
import { AuthQueryRepository } from './infrastructure/auth.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    CryptoService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthQueryRepository,
    EmailService,
    BasicAuthGuard,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [MongooseModule, BasicAuthGuard],
})
export class AccountsModule {}
