import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '../repositories/security.repository';
import { SessionOutputDto } from '../../api/output-dto/session.output-dto';

@Injectable()
export class SecurityQueryRepository {
  constructor(protected securityRepository: SecurityRepository) {}

  async getSessions(userId: string): Promise<SessionOutputDto[]> {
    const sessionDocuments = await this.securityRepository.getSessions(userId);

    return sessionDocuments.map(SessionOutputDto.mapToView);
  }
}
