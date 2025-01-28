import process from 'node:process';
import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserInputDto) {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const confirmationCode = this.jwtService.sign(
      { login: dto.login },
      { secret: process.env.ACCESS_TOKEN_SECRET },
    );

    return this.usersRepository.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
      confirmationCode,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteInstance(id);
  }
}
