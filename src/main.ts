import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 'loopback');
  app.enableCors();
  app.use(cookieParser());

  appSetup(app);

  const PORT = process.env.PORT ?? 5005;

  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}

bootstrap().then(() => console.log('______________________________'));
