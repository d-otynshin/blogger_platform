import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../infrastructure/users.repository';
import { LoginInputDto } from '../api/input-dto/login.input-dto';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
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

  async login(dto: LoginInputDto) {
    const userContextDto = await this.checkCredentials(
      dto.loginOrEmail,
      dto.password,
    );

    if (!userContextDto) {
      // TODO: change to 401 status code
      throw new NotFoundException();
    }

    const accessToken = this.jwtService.sign({ id: userContextDto.id });

    return { accessToken };
  }
}
