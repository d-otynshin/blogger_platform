import process from 'node:process';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { UsersService } from './application/users.service';
import { CryptoService } from './application/crypto.service';
import { AuthService } from './application/auth.service';
import { UsersController } from './api/users.controller';
import { AuthController } from './api/auth.controller';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { AuthQueryRepository } from './infrastructure/auth.query-repository';
import { User, UserSchema } from './domain/user.entity';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailService } from '../notifications/application/email.service';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-token.inject-constants';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { ValidateUserUseCase } from './application/use-cases/validate-user.use-case';
import { SecurityController } from './api/security.controller';
import { ThrottlerBehindProxyGuard } from './guards/limiter/throttler-behind-proxy.guard';
import { SecurityRepository } from './infrastructure/repositories/security.repository';
import { Session, SessionSchema } from './domain/session.entity';
import { JwtRefreshStrategy } from './guards/bearer/jwt-refresh.strategy';
import { SecurityQueryRepository } from './infrastructure/queries/security.query-repository';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

const services = [CryptoService, UsersService, AuthService, EmailService];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  AuthQueryRepository,
  SecurityRepository,
  SecurityQueryRepository,
];

const guards = [
  LocalStrategy,
  BasicAuthGuard,
  JwtStrategy,
  JwtRefreshStrategy,
  ThrottlerBehindProxyGuard,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    NotificationsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [UsersController, AuthController, SecurityController],
  providers: [
    ...services,
    ...repositories,
    ...guards,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: process.env.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '10s' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: process.env.REFRESH_TOKEN_SECRET, //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '20s' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    ValidateUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
  ],
  exports: [MongooseModule],
})
export class AccountsModule {}
