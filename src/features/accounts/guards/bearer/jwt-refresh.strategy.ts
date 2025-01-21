import process from 'node:process';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { RefreshTokenDto } from '../../dto/session-dto';
import { SecurityPostgresqlRepository } from '../../infrastructure/repositories/security-postgresql.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private securityRepository: SecurityPostgresqlRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string => {
          return req.cookies['refreshToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: RefreshTokenDto): Promise<RefreshTokenDto | false> {
    const session = await this.securityRepository.getSession(payload.deviceId);

    if (!session) {
      // throw NotFoundDomainException.create('Not Found');
      return false;
    }

    const { deviceId: sessionDeviceId, iat: sessionIat } = session;

    // TODO: change comparison
    if (payload.deviceId !== sessionDeviceId || payload.iat != sessionIat) {
      return false;
    }

    return { id: payload.id, deviceId: payload.deviceId, iat: payload.iat };
  }
}
