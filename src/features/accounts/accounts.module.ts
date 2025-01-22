import process from 'node:process';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule, JwtService } from '@nestjs/jwt';

/* Modules */
import { NotificationsModule } from '../notifications/notifications.module';

/* Services */
import { AuthService } from './application/auth.service';
import { UsersService } from './application/users.service';
import { CryptoService } from './application/crypto.service';
import { EmailService } from '../notifications/application/email.service';

/* Controllers */
import { AuthController } from './api/auth.controller';
import { UsersController } from './api/users.controller';
import { SecurityController } from './api/security.controller';

/* Repositories */
import { AuthQueryRepository } from './infrastructure/queries/auth.query-repository';
import { UsersSQLQueryRepository } from './infrastructure/queries/users-sql.query-repository';
import { UsersSQLRepository } from './infrastructure/repositories/users-sql.repository';
import { SecurityPostgresqlRepository } from './infrastructure/repositories/security-postgresql.repository';

/* Use Cases */
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { ValidateUserUseCase } from './application/use-cases/validate-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

/* Strategies and Guards */
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtRefreshStrategy } from './guards/bearer/jwt-refresh.strategy';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
// import { ThrottlerBehindProxyGuard } from './guards/limiter/throttler-behind-proxy.guard';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-token.inject-constants';

@Module({
  imports: [JwtModule, CqrsModule, NotificationsModule],
  controllers: [UsersController, AuthController, SecurityController],
  providers: [
    /* Services */
    AuthService,
    EmailService,
    UsersService,
    CryptoService,

    /* Repositories */
    AuthQueryRepository,
    UsersSQLQueryRepository,
    UsersSQLRepository,
    SecurityPostgresqlRepository,

    /* Use Cases */
    ValidateUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,

    /* Strategies and Guards */
    JwtStrategy,
    LocalStrategy,
    BasicAuthGuard,
    JwtRefreshStrategy,
    // ThrottlerBehindProxyGuard,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: process.env.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '5m' },
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
          signOptions: { expiresIn: '20m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
  ],
  exports: [UsersSQLRepository],
})
export class AccountsModule {}
