import { createParamDecorator, ExecutionContext } from '@nestjs/common';

class UserContextDto {
  id: string;
}

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
