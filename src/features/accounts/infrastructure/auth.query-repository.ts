import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/user.view-dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(id: string): Promise<MeViewDto> {
    const userDocument = await this.usersRepository.findById(
      new Types.ObjectId(id),
    );

    return MeViewDto.mapToView(userDocument);
  }
}
