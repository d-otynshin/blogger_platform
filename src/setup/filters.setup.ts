import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../core/exceptions/all-exceptions.filter';
import { DomainExceptionsFilter } from '../core/exceptions/domain-exception.filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionsFilter());
}
