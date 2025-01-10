import { Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception.filter';
import { Request, Response } from 'express';
import { DomainException, DomainExceptionCode } from './domain-exceptions';

@Catch(DomainException)
export class DomainExceptionsFilter extends BaseExceptionFilter {
  onCatch(
    exception: DomainException,
    response: Response,
    request: Request,
  ): void {
    response
      .status(this.calculateHttpCode(exception))
      .json(
        this.formatErrorMessage(
          this.getDefaultHttpBody(request.url, exception),
        ),
      );
  }

  calculateHttpCode(exception: DomainException) {
    switch (exception.code) {
      case DomainExceptionCode.BadRequest: {
        return HttpStatus.BAD_REQUEST;
      }
      case DomainExceptionCode.Forbidden: {
        return HttpStatus.FORBIDDEN;
      }
      case DomainExceptionCode.NotFound: {
        return HttpStatus.NOT_FOUND;
      }
      case DomainExceptionCode.Unauthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.I_AM_A_TEAPOT;
      }
    }
  }
}
