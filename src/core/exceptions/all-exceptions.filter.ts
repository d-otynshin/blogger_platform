import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  onCatch(exception: any, response: Response, request: Request): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        ...this.getDefaultHttpBody(request.url, exception),
        path: null,
        message: 'Some error occurred',
      });

      console.error(exception);
      return;
    }

    response
      .status(status)
      .json(this.getDefaultHttpBody(request.url, exception));
  }
}
