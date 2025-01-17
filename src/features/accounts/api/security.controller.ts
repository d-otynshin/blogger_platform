import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard } from '../guards/bearer/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/session-dto';
import { SecurityRepository } from '../infrastructure/repositories/security.repository';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { SecurityQueryRepository } from '../infrastructure/queries/security.query-repository';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';

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

    if (!new Types.ObjectId(user.id).equals(session.userId)) {
      console.error(session.userId, new Types.ObjectId(user.id));
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
