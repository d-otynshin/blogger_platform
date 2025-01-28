import process from 'node:process';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-token.inject-constants';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { SecurityRepository } from '../../infrastructure/repositories/security.repository';

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private securityRepository: SecurityRepository,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenCommand): Promise<RefreshTokenResponseDto> {
    // TODO: create decodedToken dto/type
    const decodedRefreshToken = await this.jwtService.verifyAsync(
      refreshToken,
      { secret: process.env.REFRESH_TOKEN_SECRET },
    );

    const userData = await this.usersRepository.findById(
      decodedRefreshToken.id,
    );

    const accessToken: string = this.accessTokenContext.sign({
      id: userData.id,
      login: userData.login,
    });

    const createdRefreshToken: string = this.refreshTokenContext.sign({
      id: userData.id,
      deviceId: decodedRefreshToken.deviceId,
      ip: decodedRefreshToken.ip,
      title: decodedRefreshToken.title,
    });

    const { iat } = await this.jwtService.verifyAsync(createdRefreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    await this.securityRepository.updateSession(
      decodedRefreshToken.deviceId,
      iat,
    );

    return { accessToken, refreshToken: createdRefreshToken };
  }
}
