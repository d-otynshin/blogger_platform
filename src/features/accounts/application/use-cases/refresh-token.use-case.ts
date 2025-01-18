import crypto from 'node:crypto';
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
    const {
      id: userId,
      deviceId,
      ip,
      title,
    } = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    const userDocument = await this.usersRepository.findById(userId);

    const accessToken = this.accessTokenContext.sign({
      id: userDocument._id,
      login: userDocument.login,
    });

    const createdRefreshToken = this.refreshTokenContext.sign({
      id: userDocument._id,
      deviceId: crypto.randomUUID(),
      ip,
      title,
    });

    const { iat } = await this.jwtService.verifyAsync(createdRefreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    await this.securityRepository.updateSession(deviceId, iat);

    return { accessToken, refreshToken: createdRefreshToken };
  }
}
