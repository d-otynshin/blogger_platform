import { Types } from 'mongoose';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UserContextDto {
  id: Types.ObjectId;
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
  (_: unknown, context: ExecutionContext): UserContextDto => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error('There is no user in the request object!');
    }

    return user;
  },
);
