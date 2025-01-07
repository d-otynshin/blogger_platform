import {
  Get,
  Post,
  Body,
  Controller,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../dto/auth.dto';
import { MeViewDto } from './user.view-dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import {
  ConfirmEmailInputDto,
  CreateUserInputDto,
  EmailInputDto,
  UpdatePasswordInputDto,
} from './input-dto/users.input-dto';
import { UsersService } from '../application/users.service';
import { EmailService } from '../../notifications/application/email.service';
import { UsersRepository } from '../infrastructure/users.repository';
import { emailTemplates } from '../../notifications/utils/templates';

import {
  ExtractUserFromRequest,
  ExtractUserIfExistsFromRequest,
} from '../../../core/decorators/extract-user-from-request';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { CryptoService } from '../application/crypto.service';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Controller('auth')
export class AuthController {
  constructor(
    // TODO: remove after moving to auth service
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.ACCEPTED)
  async register(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<void> {
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

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendEmail(@Body() resendEmailDto: EmailInputDto): Promise<void> {
    // TODO: move to auth service
    const userDocument = await this.usersRepository.findOne(
      resendEmailDto.email,
    );

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    if (userDocument.isConfirmed) {
      throw ForbiddenDomainException.create('User is already confirmed');
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

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.ACCEPTED)
  async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailInputDto,
  ): Promise<void> {
    // TODO: move to auth service
    const login = this.jwtService.decode(confirmEmailDto.code);

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

  @Post('password-recovery')
  @HttpCode(HttpStatus.ACCEPTED)
  async recoverPassword(
    @Body() passwordRecoveryDto: EmailInputDto,
  ): Promise<void> {
    // TODO: move to auth service
    const userDocument = await this.usersRepository.findOne(
      passwordRecoveryDto.email,
    );

    if (!userDocument) {
      throw NotFoundDomainException.create('User not found');
    }

    const updatedConfirmationCode = this.jwtService.sign({
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

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() updatePasswordDto: UpdatePasswordInputDto,
  ): Promise<void> {
    // TODO: move to auth service
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
