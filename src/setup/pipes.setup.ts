import { INestApplication } from '@nestjs/common';
import { formattedValidationPipe } from '../core/pipes/formatted-validation.pipe';

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(formattedValidationPipe);
}
