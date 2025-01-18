import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/output-dto/user.view-dto';
import { UsersRepository } from './repositories/users.repository';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(id: string): Promise<MeViewDto> {
    const userDocument = await this.usersRepository.findById(
      new Types.ObjectId(id),
    );

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    return MeViewDto.mapToView(userDocument);
  }
}
