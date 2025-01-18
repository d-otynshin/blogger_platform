import process from 'node:process';
import { Request } from 'express';
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
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string => {
          console.log(req.cookies['refreshToken']);
          return req.cookies.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: RefreshTokenDto): Promise<RefreshTokenDto> {
    console.error('validate', payload);
    return { id: payload.id, deviceId: payload.deviceId, iat: payload.iat };
  }
}
