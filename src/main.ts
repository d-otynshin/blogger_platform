import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  appSetup(app);

  const PORT = process.env.PORT ?? 5005; // TODO: move to configService.

  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}

bootstrap().then(() => console.log('Server is running'));
