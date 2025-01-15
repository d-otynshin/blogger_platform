import process from 'node:process';
import { Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from './crypto.service';
import { UsersService } from './users.service';
import { UsersRepository } from '../infrastructure/users.repository';
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
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private emailService: EmailService,
    private usersRepository: UsersRepository,
  ) {}

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const userDocument = await this.usersRepository.findOne(loginOrEmail);
    if (!userDocument) return null;

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password: password,
      hash: userDocument.passwordHash,
    });

    return isPasswordValid
      ? {
          id: userDocument._id.toString() as unknown as Types.ObjectId,
          login: userDocument.login,
        }
      : null;
  }

  async login(id: string) {
    const accessToken = this.jwtService.sign({ id });

    return { accessToken };
  }

  async register(createUserInputDto: CreateUserInputDto) {
    const userDocumentByEmail = await this.usersRepository.findOne(
      createUserInputDto.email,
    );

    if (userDocumentByEmail) {
      throw BadRequestDomainException.create(
        'User with this email already exists',
        'email',
      );
    }

    const userDocumentByLogin = await this.usersRepository.findOne(
      createUserInputDto.login,
    );

    if (userDocumentByLogin) {
      throw BadRequestDomainException.create(
        'User with this login already exists',
        'login',
      );
    }

    const userDocument = await this.usersService.createUser(createUserInputDto);

    await this.emailService.sendConfirmationEmail(
      createUserInputDto.email,
      userDocument.confirmationCode,
      'registration',
      emailTemplates.registrationEmail,
    );
  }

  async resendEmail(resendEmailDto: EmailInputDto): Promise<void> {
    const userDocument = await this.usersRepository.findOne(
      resendEmailDto.email,
    );

    if (!userDocument) {
      throw BadRequestDomainException.create('User not found', 'email');
    }

    if (userDocument.isConfirmed) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'email',
      );
    }

    const updatedConfirmationCode = this.jwtService.sign({
      login: userDocument.login,
    });

    userDocument.confirmationCode = updatedConfirmationCode;

    await this.usersRepository.save(userDocument);

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

    const userDocument = await this.usersRepository.findOne(login);

    if (!userDocument) {
      throw BadRequestDomainException.create('User not found', 'code');
    }

    if (userDocument.isConfirmed) {
      throw BadRequestDomainException.create(
        'User is already confirmed',
        'code',
      );
    }

    if (confirmEmailDto.code !== userDocument.confirmationCode) {
      throw ForbiddenDomainException.create(
        'Confirmation code is invalid',
        'code',
      );
    }

    userDocument.isConfirmed = true;
    await this.usersRepository.save(userDocument);

    return;
  }

  async recoverPassword(passwordRecoveryDto: EmailInputDto): Promise<void> {
    const userDocument = await this.usersRepository.findOne(
      passwordRecoveryDto.email,
    );

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    const updatedConfirmationCode: string = this.jwtService.sign({
      login: userDocument.login,
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

    const userDocument = await this.usersRepository.findOne(login);

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    userDocument.passwordHash = updatedPasswordHash;

    await this.usersRepository.save(userDocument);

    return;
  }
}
