import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException, ErrorExtension } from './domain-exceptions';
import { DomainExceptionCode } from './domain-exceptions';

export type HttpResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: ErrorExtension[];
  code: DomainExceptionCode | null;
};

export abstract class BaseExceptionFilter implements ExceptionFilter {
  abstract onCatch(
    exception: unknown,
    response: Response,
    request: Request,
  ): void;

  catch(exception: unknown, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.onCatch(exception, response, request);
  }

  getDefaultHttpBody(url: string, exception: unknown): HttpResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: url,
      message: (exception as any).message || 'Internal server error',
      code: exception instanceof DomainException ? exception.code : null,
      extensions:
        exception instanceof DomainException ? exception.extensions : [],
    };
  }

  formatErrorMessage(errorInfo: HttpResponseBody) {
    const message = errorInfo.message;
    const extensions = errorInfo.extensions;

    return {
      errorsMessages: extensions.length ? extensions : [message],
    };
  }
}
