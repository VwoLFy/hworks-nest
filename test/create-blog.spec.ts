import { AuthService } from '../src/modules/auth/application/auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from '../src/modules/users/infrastructure/users.repository';
import { CreateUserUseCase } from '../src/modules/sa.users/application/use-cases/create-user-use-case';

describe('Create user', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepository: UsersRepository;
  let authService: AuthService;
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const app: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoServer.getUri())],
      controllers: [],
      providers: [CreateUserUseCase, UsersRepository, AuthService],
    }).compile();

    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepository = app.get<UsersRepository>(UsersRepository);
    authService = app.get<AuthService>(AuthService);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('createUserUseCase', () => {
    it('should create user', async () => {
      userId = await createUserUseCase.execute({
        dto: { login: 'login', password: 'password', email: 'email@email.em' },
      });
      expect(userId).toEqual(expect.any(String));
    });
    it('should create user', async () => {
      await usersRepository.findUserById(userId);
    });
    it('should return id', async () => {
      expect(
        await authService.checkCredentialsOfUser({
          loginOrEmail: 'login',
          password: 'password',
        }),
      ).toEqual(expect.any(String));
    });
  });
});

describe('Create user with mock', () => {
  let createUserUseCase: CreateUserUseCase;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const app: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoServer.getUri())],
      controllers: [],
      providers: [CreateUserUseCase, UsersRepository],
    })
      .overrideProvider(UsersRepository)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .useValue({ saveUser: () => {} })
      .compile();

    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('createUserUseCase', () => {
    it('should create user', async () => {
      const userId = await createUserUseCase.execute({
        dto: { login: 'login', password: 'password', email: 'email@email.em' },
      });

      expect(userId).toEqual(expect.any(String));
    });
  });
});

describe('Create user with mock2', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepository: UsersRepository;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const app: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoServer.getUri())],
      controllers: [],
      providers: [CreateUserUseCase, UsersRepository],
    }).compile();

    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepository = app.get<UsersRepository>(UsersRepository);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('createUserUseCase', () => {
    it('should create user', async () => {
      jest.spyOn(usersRepository, 'saveUser').mockImplementation();

      const userId = await createUserUseCase.execute({
        dto: { login: 'login', password: 'password', email: 'email@email.em' },
      });

      expect(userId).toEqual(expect.any(String));

      expect(usersRepository.saveUser).toBeCalled();
    });
  });
});
