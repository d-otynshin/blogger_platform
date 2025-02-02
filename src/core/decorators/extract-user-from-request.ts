import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UserContextDto {
  id: string;
  login: string;
}

export const ExtractUserFromRequest = createParamDecorator(
  (_: unknown, context: ExecutionContext): UserContextDto => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error('There is no user in the request object!');
    }

    return user;
  },
);

export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (_: unknown, context: ExecutionContext): UserContextDto | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
