import { Test, TestingModule } from '@nestjs/testing';
import { UsersTestManager } from './helpers/users-test.manager';
import { CreateUserInputDto } from '../features/accounts/api/input-dto/users.input-dto';
import { UserViewDto } from '../features/accounts/api/output-dto/user.view-dto';
import { INestApplication } from '@nestjs/common';
import { User } from '../features/accounts/domain/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';

describe('quiz', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    console.log('beforeAll');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          synchronize: true,
          url: process.env.DB_URL,
          ssl: { rejectUnauthorized: false },
          entities: [User],
        }),
      ],
    }).compile();

    console.log('DB URL', 'process.env.DB_URL');

    app = moduleFixture.createNestApplication();
    await app.init();
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
