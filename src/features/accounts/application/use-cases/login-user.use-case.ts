import crypto from 'node:crypto';
import process from 'node:process';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ValidateUserCommand } from './validate-user.use-case';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-token.inject-constants';
import { SecurityRepository } from '../../infrastructure/repositories/security.repository';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class LoginUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private securityRepository: SecurityRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({
    loginOrEmail,
    password,
    ip: userIp,
    title: userTitle,
  }: LoginUserCommand): Promise<LoginResponseDto> {
    const userData = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );

    if (!userData) {
      throw NotFoundDomainException.create('User does not exist');
    }

    const accessToken = this.accessTokenContext.sign({
      id: userData.id,
      login: userData.login,
    });

    const deviceId = crypto.randomUUID();

    const refreshToken = this.refreshTokenContext.sign({
      id: userData.id,
      ip: userIp,
      title: userTitle,
      deviceId,
    });

    const decodedToken = this.refreshTokenContext.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    await this.securityRepository.createSession({
      userId: userData.id,
      iat: decodedToken.iat,
      title: userTitle,
      ip: userIp,
      deviceId,
    });

    return { accessToken, refreshToken };
  }
}
