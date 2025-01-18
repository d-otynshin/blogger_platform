import process from 'node:process';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenDto } from '../../dto/session-dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_SECRET_KEY,
    });
  }

  async validate(payload: RefreshTokenDto): Promise<RefreshTokenDto> {
    return { id: payload.id, deviceId: payload.deviceId, iat: payload.iat };
  }
}
