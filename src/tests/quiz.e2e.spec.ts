import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UsersTestManager } from './helpers/users-test.manager';
import { CreateUserInputDto } from '../features/accounts/api/input-dto/users.input-dto';
import { UserViewDto } from '../features/accounts/api/output-dto/user.view-dto';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { appSetup } from '../setup/app.setup';

describe('quiz', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    console.log('beforeAll');
    const testingAppModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingAppModule.createNestApplication();

    appSetup(app);

    await app.init();

    console.log('DB URL', 'process.env.DB_URL');

    await app.init();

    userTestManger = new UsersTestManager(app);
  });

  it('should create user', async () => {
    const body: CreateUserInputDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const userViewDto: UserViewDto = await userTestManger.createUser(body);

    expect(userViewDto).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
