import {
  Get,
  Delete,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { JwtRefreshGuard } from '../guards/bearer/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/session-dto';
import { SessionSQLOutputDto } from './output-dto/session.output-dto';
import { SecurityRepository } from '../infrastructure/repositories/security.repository';

import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Controller('security')
export class SecurityController {
  constructor(private securityRepository: SecurityRepository) {}

  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  async getSessions(@ExtractUserFromRequest() user: RefreshTokenDto) {
    const sessionsData = await this.securityRepository.getSessions(user.id);

    return sessionsData.map(SessionSQLOutputDto.mapToView);
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSessionById(
    @ExtractUserFromRequest() user: RefreshTokenDto,
    @Param('id') deviceId: string,
  ) {
    const session = await this.securityRepository.getSession(deviceId);

    if (!session) {
      throw NotFoundDomainException.create('Session not found', 'deviceId');
    }

    if (session.user_id !== user.id) {
      throw ForbiddenDomainException.create('Session not found', 'deviceId');
    }

    const isTerminated =
      await this.securityRepository.terminateBySessionId(deviceId);

    if (!isTerminated) {
      throw BadRequestDomainException.create('Session not found', 'deviceId');
    }

    return;
  }
}
