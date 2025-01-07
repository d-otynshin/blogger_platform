import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { exceptionFilterSetup } from './filters.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  exceptionFilterSetup(app);
}
