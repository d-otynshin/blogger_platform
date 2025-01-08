import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { exceptionFiltersSetup } from './filters.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  exceptionFiltersSetup(app);
}
