import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { JwtRefreshGuard } from '../guards/bearer/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/session-dto';
import { SecurityRepository } from '../infrastructure/repositories/security.repository';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { SecurityQueryRepository } from '../infrastructure/queries/security.query-repository';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Controller('security')
export class SecurityController {
  constructor(
    private securityRepository: SecurityRepository,
    protected securityQueryRepository: SecurityQueryRepository,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  async getSessions(@ExtractUserFromRequest() user: RefreshTokenDto) {
    return this.securityQueryRepository.getSessions(user.id);
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  async terminateSessions(@ExtractUserFromRequest() user: RefreshTokenDto) {
    const isTerminated = await this.securityRepository.terminateSessions(
      user.deviceId,
    );

    if (!isTerminated) {
      throw NotFoundDomainException.create('Session not found', 'deviceId');
    }

    return;
  }

  @Delete('devices/:id')
  @UseGuards(JwtRefreshGuard)
  async terminateSessionById(@ExtractUserFromRequest() user: RefreshTokenDto) {
    const isTerminated = await this.securityRepository.terminateBySessionId(
      user.deviceId,
    );

    if (!isTerminated) {
      throw NotFoundDomainException.create('Session not found', 'deviceId');
    }

    return;
  }
}
