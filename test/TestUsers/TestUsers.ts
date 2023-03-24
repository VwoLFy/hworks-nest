import { UserViewModel } from '../../src/modules/users/api/models/UserViewModel';
import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { INestApplication } from '@nestjs/common';

export class TestUsers {
  constructor(private app: INestApplication) {}

  async createUser(
    createUserBody: { login: string; password: string; email: string },
    httpStatus: HTTP_Status = HTTP_Status.CREATED_201,
  ): Promise<UserViewModel> {
    const result = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(createUserBody)
      .expect(httpStatus);

    return result.body;
  }

  async loginUser(
    loginUserBody: { loginOrEmail: string; password: string },
    httpStatus: HTTP_Status = HTTP_Status.OK_200,
  ): Promise<{ accessToken: string }> {
    const result = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: loginUserBody.loginOrEmail, password: loginUserBody.password })
      .expect(httpStatus);

    return result.body;
  }

  async createUsersWithTokens(countUsers: number): Promise<{ users: UserViewModel[]; accessTokens: string[] }> {
    const users: UserViewModel[] = [];
    const accessTokens: string[] = [];

    for (let i = 1; i <= countUsers; i++) {
      const createUserBody = {
        login: `login${i}`,
        password: `password`,
        email: `string${i}@sdf.ee`,
      };

      const user = await this.createUser(createUserBody);
      users.push(user);

      const token = await this.loginUser({ loginOrEmail: createUserBody.login, password: createUserBody.password });
      accessTokens.push(token.accessToken);
    }

    return { users: users, accessTokens: accessTokens };
  }
}
