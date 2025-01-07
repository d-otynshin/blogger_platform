import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../dto/auth.dto';
import { UsersService } from './users.service';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findOne(loginOrEmail);
    if (!user) return null;

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password: password,
      hash: user.passwordHash,
    });

    return isPasswordValid ? { id: user._id.toString() } : null;
  }

  async login(id: string) {
    const accessToken = this.jwtService.sign({ id });

    return { accessToken };
  }

  async register(createUserInputDto: CreateUserInputDto) {
    const userViewDto = await this.usersService.createUser(createUserInputDto);
    const confirmationCode = this.jwtService.sign({ login: userViewDto.login });

    // TODO: move to usersService?
    await this.UserModel.findByIdAndUpdate(
      userViewDto.id,
      { confirmationCode, isConfirmed: false },
      { new: true, runValidators: true },
    );

    return;
  }
}
