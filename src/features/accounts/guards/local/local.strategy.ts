import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UserContextDto } from '../../dto/auth.dto';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(username: string, password: string): Promise<UserContextDto> {
    const user = await this.authService.checkCredentials(username, password);
    if (!user) {
      throw UnauthorizedDomainException.create('Authentication failed', 'user');
    }

    return user;
  }
}
