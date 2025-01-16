import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { exceptionFiltersSetup } from './filters.setup';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

export const validationConstraintSetup = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  validationConstraintSetup(app);
  exceptionFiltersSetup(app);
}
