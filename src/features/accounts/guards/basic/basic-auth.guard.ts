import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly validUsername = 'admin';
  private readonly validPassword = 'qwerty';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw UnauthorizedDomainException.create('Authentication failed');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    const isValid =
      username === this.validUsername && password === this.validPassword;

    if (!isValid) {
      throw UnauthorizedDomainException.create(
        'Invalid Credentials',
        'usernameOrPassword',
      );
    }

    return isValid;
  }
}
