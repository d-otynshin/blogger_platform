import { Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UsersPostgresqlRepository } from '../repositories/users-postgresql.repository';
import { MeSQLViewDto } from '../../api/output-dto/user.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersPostgresqlRepository) {}

  async me(id: string): Promise<MeSQLViewDto> {
    const userData = await this.usersRepository.findById(id);

    if (!userData) {
      throw NotFoundDomainException.create('User not found');
    }

    return MeSQLViewDto.mapToView(userData);
  }
}
