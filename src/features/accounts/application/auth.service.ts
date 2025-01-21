import process from 'node:process';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from './crypto.service';
import { UsersService } from './users.service';
import { UserContextDto } from '../dto/auth.dto';
import { emailTemplates } from '../../notifications/utils/templates';
import { EmailService } from '../../notifications/application/email.service';

import {
  ConfirmEmailInputDto,
  CreateUserInputDto,
  EmailInputDto,
  UpdatePasswordInputDto,
} from '../api/input-dto/users.input-dto';

/* From Core */
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { UsersPostgresqlRepository } from '../infrastructure/repositories/users-postgresql.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private emailService: EmailService,
    private usersRepository: UsersPostgresqlRepository,
  ) {}

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const userData = await this.usersRepository.findOne(loginOrEmail);
    if (!userData) return null;

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password: password,
      hash: userData.password_hash,
    });

    // TODO: separate for mongo, add type
    return isPasswordValid ? { id: userData.id, login: userData.login } : null;
  }

  async register(createUserInputDto: CreateUserInputDto) {
    const userDataByEmail = await this.usersRepository.findOne(
      createUserInputDto.email,
    );

    if (userDataByEmail) {
      throw BadRequestDomainException.create(
        'User with this email already exists',
        'email',
      );
    }

    const userDataByLogin = await this.usersRepository.findOne(
      createUserInputDto.login,
    );

    if (userDataByLogin) {
      throw BadRequestDomainException.create(
        'User with this login already exists',
        'login',
      );
    }

    const userData = await this.usersService.createUser(createUserInputDto);

    await this.emailService.sendConfirmationEmail(
      createUserInputDto.email,
      userData.confirmationCode,
      'registration',
      emailTemplates.registrationEmail,
    );
  }

  async resendEmail(resendEmailDto: EmailInputDto): Promise<void> {
    const userData = await this.usersRepository.findOne(resendEmailDto.email);

    if (!userData) {
      throw BadRequestDomainException.create('User not found', 'email');
    }

    console.log(userData);

    if (userData.is_confirmed) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'email',
      );
    }

    const updatedConfirmationCode = this.jwtService.sign(
      { login: userData.login },
      { secret: process.env.ACCESS_TOKEN_SECRET },
    );

    await this.usersRepository.updateConfirmationCode(
      userData.id,
      updatedConfirmationCode,
    );

    await this.emailService.sendConfirmationEmail(
      resendEmailDto.email,
      updatedConfirmationCode,
      'resend',
      emailTemplates.registrationEmail,
    );

    return;
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailInputDto): Promise<void> {
    const parsedCode: { login: string } = this.jwtService.decode(
      confirmEmailDto.code,
    );

    if (!parsedCode) {
      throw BadRequestDomainException.create('Invalid code token', 'code');
    }

    const { login } = parsedCode;

    const userData = await this.usersRepository.findOne(login);

    if (!userData) {
      throw BadRequestDomainException.create('User not found', 'code');
    }

    if (userData.isConfirmed) {
      throw BadRequestDomainException.create(
        'User is already confirmed',
        'code',
      );
    }

    if (confirmEmailDto.code !== userData.confirmation_code) {

      throw BadRequestDomainException.create(
        'Confirmation code is invalid',
        'code',
      );
    }

    await this.usersRepository.updateConfirmationStatus(userData.id, true);

    return;
  }

  async recoverPassword(passwordRecoveryDto: EmailInputDto): Promise<void> {
    const userData = await this.usersRepository.findOne(
      passwordRecoveryDto.email,
    );

    if (!userData) {
      throw NotFoundDomainException.create('User not found');
    }

    const updatedConfirmationCode: string = this.jwtService.sign({
      login: userData.login,
    });

    await this.emailService.sendConfirmationEmail(
      passwordRecoveryDto.email,
      updatedConfirmationCode,
      'recover',
      emailTemplates.passwordRecoveryEmail,
    );

    return;
  }

  async newPassword(updatePasswordDto: UpdatePasswordInputDto): Promise<void> {
    const decodedRecoveryToken = await this.jwtService.verifyAsync(
      updatePasswordDto.recoveryCode,
      { secret: process.env.ACCESS_TOKEN_SECRET },
    );

    if (!decodedRecoveryToken) {
      throw NotFoundDomainException.create('User not found');
    }

    const { login } = decodedRecoveryToken;

    const updatedPasswordHash = await this.cryptoService.createPasswordHash(
      updatePasswordDto.newPassword,
    );

    const userData = await this.usersRepository.findOne(login);

    if (!userData) {
      throw NotFoundDomainException.create('User not found');
    }

    await this.usersRepository.updatePasswordHash(
      userData.id,
      updatedPasswordHash,
    );

    return;
  }
}
