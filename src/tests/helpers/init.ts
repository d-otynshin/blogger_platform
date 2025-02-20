import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { EmailService } from '../../features/notifications/application/email.service';
import { EmailServiceMock } from './email-service.mock';
import { appSetup } from '../../setup/app.setup';
import { UsersTestManager } from './users-test.manager';
import { deleteAllData } from './delete-all-data';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  appSetup(app);

  await app.init();

  const databaseConnection = app.get<DataSource>(getDataSourceToken());
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
  };
};
