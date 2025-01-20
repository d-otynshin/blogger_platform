import crypto from 'node:crypto';
import process from 'node:process';
import { Types } from 'mongoose';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ValidateUserCommand } from './validate-user.use-case';
import { UserDocument } from '../../domain/user.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { SecurityRepository } from '../../infrastructure/repositories/security.repository';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-token.inject-constants';

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
    const userDocument: UserDocument = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );

    console.log('login', userDocument);

    if (!userDocument) {
      throw NotFoundDomainException.create('User does not exist');
    }

    const accessToken = this.accessTokenContext.sign({
      id: userDocument._id,
      login: userDocument.login,
    });

    const deviceId = crypto.randomUUID();

    const refreshToken = this.refreshTokenContext.sign({
      id: userDocument._id,
      ip: userIp,
      title: userTitle,
      deviceId,
    });

    console.log('created tokens');

    const decodedToken = this.refreshTokenContext.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    const sessionDocument = await this.securityRepository.createSession({
      userId: new Types.ObjectId(userDocument._id),
      exp: decodedToken.exp,
      iat: decodedToken.iat,
      title: userTitle,
      ip: userIp,
      deviceId,
    });

    console.log('created session');

    await this.securityRepository.save(sessionDocument);

    return { accessToken, refreshToken };
  }
}
