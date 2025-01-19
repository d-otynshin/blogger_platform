import process from 'node:process';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { RefreshTokenDto } from '../../dto/session-dto';
import { SecurityRepository } from '../../infrastructure/repositories/security.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly securityRepository: SecurityRepository) {
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
    console.log('payload', payload);
    const session = await this.securityRepository.getSession(payload.deviceId);

    if (!session) {
      console.log('session', session);
      throw NotFoundDomainException.create('Not Found');
    }

    const { deviceId: sessionDeviceId, iat: sessionIat } = session;

    // TODO: change comparison
    if (payload.deviceId !== sessionDeviceId || payload.iat != sessionIat) {
      return false;
    }

    return { id: payload.id, deviceId: payload.deviceId, iat: payload.iat };
  }
}
