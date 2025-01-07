import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user-dto';
import { UserViewDto } from '../api/user.view-dto';
import { JWTService } from './jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private jwtService: JWTService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserViewDto> {
    const passwordHash = await this.jwtService.createPasswordHash(dto.password);

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

  async deleteUser(id: Types.ObjectId): Promise<boolean> {
    const deleteResult = await this.UserModel.deleteOne({ _id: id });

    return deleteResult.deletedCount === 1;
  }
}
