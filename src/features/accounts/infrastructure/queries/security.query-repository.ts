import process from 'node:process';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityRepository } from '../repositories/security.repository';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    private jwtService: JwtService,
    protected securityRepository: SecurityRepository,
  ) {}

  async getSessions(token: string) {
    const decodedToken = await this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    // TODO: throw error?
    if (!decodedToken) return null;

    const { userId } = decodedToken;

    return this.securityRepository.getSessions(userId);
  }
}
