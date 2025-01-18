import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityRepository } from '../../infrastructure/repositories/security.repository';

@Injectable()
export class JwtRefreshValidationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityRepository: SecurityRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.refreshToken;

    const decodedToken = await this.jwtService.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    const { deviceId, iat } = decodedToken;
    const session = await this.securityRepository.getSession(deviceId);

    if (!session) return false;

    const { deviceId: sessionDeviceId, iat: sessionIat } = session;
    return sessionDeviceId === deviceId && sessionIat === iat;
  }
}
