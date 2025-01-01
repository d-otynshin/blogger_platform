import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user-dto';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    //TODO: move to bcrypt service
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async updateUser(id: string, dto: CreateUserInputDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    // user.update(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  // async deleteUser(id: string) {
  //   const user = await this.usersRepository.findNonDeletedOrNotFoundFail(id);
  //
  //   user.makeDeleted();
  //
  //   await this.usersRepository.save(user);
  // }
}