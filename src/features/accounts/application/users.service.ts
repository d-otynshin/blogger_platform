import process from 'node:process';
import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { UpdateUserDto } from '../dto/create-user-dto';
import { UserViewDto } from '../api/output-dto/user.view-dto';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<UserDocument> {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const confirmationCode = this.jwtService.sign(
      { login: dto.login },
      { secret: process.env.ACCESS_TOKEN_SECRET },
    );

    const userDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
      confirmationCode,
    });

    await this.usersRepository.save(userDocument);

    return userDocument;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserViewDto> {
    const user = await this.UserModel.findByIdAndUpdate(id, dto, { new: true });

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async deleteUser(id: Types.ObjectId): Promise<boolean> {
    const deleteResult = await this.UserModel.deleteOne({ _id: id });

    return deleteResult.deletedCount === 1;
  }
}
