import { Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UsersRepository } from '../repositories/users.repository';
import { MeSQLViewDto } from '../../api/output-dto/user.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(id: string): Promise<MeSQLViewDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    return MeSQLViewDto.mapToView(user);
  }
}
