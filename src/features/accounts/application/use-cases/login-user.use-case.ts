import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-token.inject-constants';

import { ValidateUserCommand } from './validate-user.use-case';
import { UserDocument } from '../../domain/user.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class LoginUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private commandBus: CommandBus,
  ) {}

  async execute({
    loginOrEmail,
    password,
  }: LoginUserCommand): Promise<LoginResponseDto> {
    const userDocument: UserDocument = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );

    if (!userDocument) {
      throw NotFoundDomainException.create('User does not exist');
    }

    const accessToken = this.accessTokenContext.sign({
      id: userDocument._id,
      login: userDocument.login,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: userDocument._id,
      deviceId: 'deviceId',
    });

    return { accessToken, refreshToken };
  }
}
