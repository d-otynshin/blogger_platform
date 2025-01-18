import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, JwtRefreshGuard } from '../guards/bearer/jwt-auth.guard';
import { UserContextDto } from '../dto/auth.dto';
import { RefreshTokenDto } from '../dto/session-dto';
import { SecurityRepository } from '../infrastructure/repositories/security.repository';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';

@Controller('security')
export class SecurityController {
  constructor(private securityRepository: SecurityRepository) {}

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async getSessions(@ExtractUserFromRequest() user: UserContextDto) {
    return this.securityRepository.getSessions(user.id);
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  async terminateSessions(@ExtractUserFromRequest() user: RefreshTokenDto) {
    return this.securityRepository.terminateSessions(user.deviceId);
  }

  @Delete('devices/:id')
  @UseGuards(JwtRefreshGuard)
  async terminateSessionById(@ExtractUserFromRequest() user: RefreshTokenDto) {
    return this.securityRepository.terminateBySessionId(user.deviceId);
  }
}
