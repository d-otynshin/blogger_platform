import process from 'node:process';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dto/create-user-dto';
import { UserViewDto } from '../api/output-dto/user.view-dto';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { UsersPostgresqlRepository } from '../infrastructure/repositories/users-postgresql.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersPostgresqlRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
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

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserViewDto> {
    const userData = await this.usersRepository.findById(id);

    if (!userData) {
      throw NotFoundDomainException.create('User not found');
    }

    return this.usersRepository.updateUserEmail(id, dto.email);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteInstance(id);
  }
}
