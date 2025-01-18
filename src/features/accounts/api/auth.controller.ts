import { Response, Request } from 'express';
import {
  Get,
  Post,
  Res,
  Body,
  Controller,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../dto/auth.dto';
import { MeViewDto } from './output-dto/user.view-dto';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { JwtAuthGuard, JwtRefreshGuard } from '../guards/bearer/jwt-auth.guard';
import {
  ConfirmEmailInputDto,
  CreateUserInputDto,
  EmailInputDto,
  UpdatePasswordInputDto,
} from './input-dto/users.input-dto';

import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { LoginInputDto } from './input-dto/login.input-dto';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { RefreshTokenDto } from '../dto/session-dto';
import { SecurityRepository } from '../infrastructure/repositories/security.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authQueryRepository: AuthQueryRepository,
    private readonly securityRepository: SecurityRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() loginDto: LoginInputDto,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginUserCommand(
        loginDto.loginOrEmail,
        loginDto.password,
        req.ip,
        req.headers['user-agent'],
      ),
    );

    const EXPIRATION_TIME = {
      ACCESS: 10 * 1000,
      REFRESH: 20000,
    };

    const cookieConfig = {
      httpOnly: true,
      secure: true,
      maxAge: EXPIRATION_TIME.REFRESH,
    };

    res.cookie('refreshToken', refreshToken, cookieConfig);
    res.status(HttpStatus.OK).json({ accessToken });

    return { accessToken };
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

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];

    const refreshTokenResponse = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );

    const { accessToken, refreshToken: updatedRefreshToken } =
      refreshTokenResponse;

    const cookieConfig = {
      httpOnly: true,
      secure: true,
    };

    console.log('refreshToken', refreshToken);

    res.cookie('refreshToken', updatedRefreshToken, cookieConfig);
    res.status(200).json({ accessToken });

    return;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  async logout(
    @ExtractUserFromRequest() decodedToken: RefreshTokenDto,
    @Res() res: Response,
  ) {
    const { deviceId } = decodedToken;

    const isTerminated =
      await this.securityRepository.terminateBySessionId(deviceId);

    return isTerminated
      ? res.status(204).send()
      : res.status(401).send({ error: 'Could not terminate session' });
  }
}
