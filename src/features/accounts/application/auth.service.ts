import process from 'node:process';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../dto/auth.dto';
import { UsersService } from './users.service';
import { emailTemplates } from '../../notifications/utils/templates';
import { EmailService } from '../../notifications/application/email.service';

import {
  ConfirmEmailInputDto,
  CreateUserInputDto,
  EmailInputDto,
  UpdatePasswordInputDto,
} from '../api/input-dto/users.input-dto';

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

    this.emailService
      .sendConfirmationEmail(
        createUserInputDto.email,
        userDocument.confirmationCode,
        'registration',
        emailTemplates.registrationEmail,
      )
      .then(() => console.log('Email sent'));
  }

  async resendEmail(resendEmailDto: EmailInputDto): Promise<void> {
    const userDocument = await this.usersRepository.findOne(
      resendEmailDto.email,
    );

    if (!userDocument) {
      throw BadRequestDomainException.create('User not found', 'email');
    }

    if (userDocument.isConfirmed) {
      throw ForbiddenDomainException.create(
        'User is already confirmed',
        'email',
      );
    }

    const updatedConfirmationCode = this.jwtService.sign({
      login: userDocument.login,
    });

    userDocument.confirmationCode = updatedConfirmationCode;

    await this.usersRepository.save(userDocument);

    this.emailService
      .sendConfirmationEmail(
        resendEmailDto.email,
        updatedConfirmationCode,
        'resend',
        emailTemplates.registrationEmail,
      )
      .then(() => console.log('Email sent'));

    return;
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailInputDto): Promise<void> {
    const login: string = this.jwtService.decode(confirmEmailDto.code);

    const userDocument = await this.usersRepository.findOne(login);

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    if (userDocument.isConfirmed) {
      throw ForbiddenDomainException.create('User is already confirmed');
    }

    if (confirmEmailDto.code !== userDocument.confirmationCode) {
      throw ForbiddenDomainException.create('Confirmation code is invalid');
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

    this.emailService
      .sendConfirmationEmail(
        passwordRecoveryDto.email,
        updatedConfirmationCode,
        'recover',
        emailTemplates.passwordRecoveryEmail,
      )
      .then(() => console.log('Email sent'));

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
