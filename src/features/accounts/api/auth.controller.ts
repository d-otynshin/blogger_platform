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
import { MeViewDto } from './output-dto/user.view-dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import {
  ConfirmEmailInputDto,
  CreateUserInputDto,
  EmailInputDto,
  UpdatePasswordInputDto,
} from './input-dto/users.input-dto';

import {
  ExtractUserFromRequest,
  ExtractUserIfExistsFromRequest,
} from '../../../core/decorators/extract-user-from-request';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async register(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<void> {
    return this.authService.register(createUserInputDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() resendEmailDto: EmailInputDto): Promise<void> {
    return this.authService.resendEmail(resendEmailDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailInputDto,
  ): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(
    @Body() passwordRecoveryDto: EmailInputDto,
  ): Promise<void> {
    return this.authService.recoverPassword(passwordRecoveryDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(
    @Body() updatePasswordDto: UpdatePasswordInputDto,
  ): Promise<void> {
    return this.authService.newPassword(updatePasswordDto);
  }
}
