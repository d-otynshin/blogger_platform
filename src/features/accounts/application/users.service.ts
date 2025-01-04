import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user-dto';
import { UserViewDto } from '../api/user.view-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserViewDto> {
    //TODO: move to bcrypt service
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);

    return UserViewDto.mapToView(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserViewDto> {
    const user = await this.UserModel.findByIdAndUpdate(id, dto, { new: true });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async deleteUser(id: Types.ObjectId): Promise<boolean | null> {
    const deleteResult = await this.UserModel.deleteOne({ _id: id });

    const isDeleted = deleteResult.deletedCount === 1;

    if (isDeleted) {
      return null;
    }

    return;
  }
}
