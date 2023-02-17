import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HTTP_Status, LikeStatus } from '../src/main/types/enums';
import { BlogViewModel } from '../src/modules/blogs/api/models/BlogViewModel';
import { PostViewModel } from '../src/modules/posts/api/models/PostViewModel';
import { UserViewModel } from '../src/modules/users/api/models/UserViewModel';
import { LoginSuccessViewModel } from '../src/modules/auth/api/models/LoginSuccessViewModel';
import { CommentViewModel } from '../src/modules/comments/api/models/CommentViewModel';
import { DeviceViewModel } from '../src/modules/security/api/models/DeviceViewModel';
import { BlogViewModelSA } from '../src/modules/blogs/api/models/BlogViewModelSA';
import { EmailAdapter } from '../src/modules/auth/infrastructure/email.adapter';
import { EmailService } from '../src/modules/auth/application/email.service';
import { appConfig } from '../src/app.config';
import { CommentViewModelBl } from '../src/modules/comments/api/models/CommentViewModel.Bl';

const checkError = (apiErrorResult: { message: string; field: string }, field: string) => {
  expect(apiErrorResult).toEqual({
    errorsMessages: [
      {
        message: expect.any(String),
        field: field,
      },
    ],
  });
};
const delay = async (delay = 1000) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, delay);
  });
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue({ sendEmail: () => 'OK' })
      .compile();

    app = moduleFixture.createNestApplication();
    appConfig(app);
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  describe('Blogger-  blogs', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let blog3: BlogViewModel;
    it('Create and login 2 users', async function () {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;
    });
    it('GET should return 200', async function () {
      await request(app.getHttpServer()).get('/blogs').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

      await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('POST shouldn`t create blog with incorrect "data"', async () => {
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: '    ',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: ' htt://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: '        ',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 1,
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: 1,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 1,
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 1,
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: 1,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 1,
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'a'.repeat(16),
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'a'.repeat(501),
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: 'https://localhost1.uuu/blogs' + 'a'.repeat(100),
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .get('/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('POST should create blog by user1 with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' NEW NAME   ',
          description: 'description  ',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = result.body;

      expect(blog1).toEqual({
        id: expect.any(String),
        name: 'NEW NAME',
        description: 'description',
        websiteUrl: 'https://localhost1.uuu/blogs',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });
    it('POST should create + 1 blog by user1 and 1 blog by user2 with correct data', async () => {
      let result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'what name 2  ',
          description: 'adescription  2',
          websiteUrl: ' https://localhost1.uuu/blogs2  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog2 = result.body;

      result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          name: '  user2 blog  ',
          description: 'description  3',
          websiteUrl: ' https://localhost1.uuu/blogs3  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog3 = result.body;
    });
    it('GET by bloggers should return 200 and blogs', async function () {
      await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog2, blog1],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog3],
        });
    });
    it('GET by blog1 with query should return 200 and blogs', async function () {
      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=name')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog2, blog1],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?sortDirection=asc')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog1, blog2],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?sortBy=description')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog1, blog2],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=name&pageSize=1')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 1,
          pageSize: 1,
          totalCount: 2,
          items: [blog2],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=name&pageSize=1&pageNumber=2')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 2,
          pageSize: 1,
          totalCount: 2,
          items: [blog1],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=2')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog2],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=new')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog1],
        });

      await request(app.getHttpServer())
        .get('/blogger/blogs?searchNameTerm=123')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('PUT shouldn`t update blog with incorrect data', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: '    ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 'Updating description',
          websiteUrl: 'http://api-swagger.it-incubator',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'valid name',
          description: 1,
          websiteUrl: 'http://api-swagger.it-incubator',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/636a2a16f394608b01446e12`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT shouldn`t update blog that does not belong to current user', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('PUT should update blog with correct data', async () => {
      const oldBlog1 = { ...blog1 };

      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.NO_CONTENT_204);
      const result = await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200);
      blog1 = result.body;

      expect(blog1).toEqual({
        id: expect.any(String),
        name: 'Updating NAME',
        description: 'Updating description',
        websiteUrl: 'https://api-swagger.it-incubator.ru/',
        createdAt: expect.any(String),
        isMembership: false,
      });
      expect(blog1).not.toEqual(oldBlog1);
    });
    it('DELETE shouldn`t delete blog with incorrect "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/636a2a16f394608b01446e12`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200, blog1);
    });
    it('DELETE shouldn`t delete blog that does not belong to current user', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);

      await request(app.getHttpServer()).delete(`/blogger/blogs/${blog1.id}`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('DELETE should delete blog with correct "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog2.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer()).get(`/blogs/${blog2.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE shouldn`t delete blog that is not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
  });

  describe('SA-  blogs', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    let user2: UserViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let blog1: BlogViewModelSA;
    let blog2: BlogViewModelSA;
    let blog3: BlogViewModelSA;
    let post1: PostViewModel;
    let post2: PostViewModel;
    let post3: PostViewModel;
    let post4: PostViewModel;
    it('Create and login 2 users', async function () {
      let resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = resultUser.body;

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user2 = resultUser.body;

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;
    });
    it('GET should return 401', async function () {
      await request(app.getHttpServer()).get('/sa/blogs').expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET should return 200', async function () {
      await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });

      await request(app.getHttpServer())
        .get('/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('Create 2 blog by user1 and 1 blog by user2', async () => {
      let result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' NEW NAME blog1  ',
          description: 'description1 ',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      const blogB1 = result.body;

      expect(blogB1).toEqual({
        id: expect.any(String),
        name: 'NEW NAME blog1',
        description: 'description1',
        websiteUrl: 'https://localhost1.uuu/blogs',
        createdAt: expect.any(String),
        isMembership: false,
      });
      result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'what name blog2  ',
          description: 'adescription  2',
          websiteUrl: ' https://localhost1.uuu/blogs2  ',
        })
        .expect(HTTP_Status.CREATED_201);
      const blogB2 = result.body;

      result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          name: '  user2 blog  ',
          description: 'description3',
          websiteUrl: ' https://localhost1.uuu/blogs3  ',
        })
        .expect(HTTP_Status.CREATED_201);
      const blogB3 = result.body;

      blog1 = {
        ...blogB1,
        blogOwnerInfo: { userId: user1.id, userLogin: user1.login },
        banInfo: { isBanned: false, banDate: null },
      };
      blog2 = {
        ...blogB2,
        blogOwnerInfo: { userId: user1.id, userLogin: user1.login },
        banInfo: { isBanned: false, banDate: null },
      };
      blog3 = {
        ...blogB3,
        blogOwnerInfo: { userId: user2.id, userLogin: user2.login },
        banInfo: { isBanned: false, banDate: null },
      };
    });
    it('GET by bloggers should return 200 and blogs', async function () {
      await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog3, blog2, blog1],
        });
    });
    it('GET by blog1 with query should return 200 and blogs', async function () {
      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=name')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog2, blog1],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?sortDirection=asc')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog1, blog2, blog3],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?sortBy=description')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog3, blog1, blog2],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=name&pageSize=1')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 1,
          pageSize: 1,
          totalCount: 2,
          items: [blog2],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=name&pageSize=1&pageNumber=2')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 2,
          pageSize: 1,
          totalCount: 2,
          items: [blog1],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=2')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog3, blog2],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=new')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog1],
        });

      await request(app.getHttpServer())
        .get('/sa/blogs?searchNameTerm=123')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('Bind blog should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/bind-with-user/${user1.id}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('Bind blog should return 404 if data is incorrect', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/1/bind-with-user/${user1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/bind-with-user/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/sa/blogs/${user1.id}/bind-with-user/${user1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('Bind blog should return 400 if blog already bound to any user', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/bind-with-user/${user1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST should create 2 posts blog1 and one for blog2 and blog3', async () => {
      let result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post1 for blog1',
          content: 'valid content1_1',
          shortDescription: 'shortDescription       shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post1 = result.body;

      result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post2 for blog1',
          content: 'valid content1_2',
          shortDescription: 'shortDescription       shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post2 = result.body;

      result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post for blog2',
          content: 'valid content2',
          shortDescription: 'shortDescription       shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post3 = result.body;

      result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog3.id}/posts`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          title: 'post for blog3',
          content: 'valid content3',
          shortDescription: 'shortDescription       shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post4 = result.body;
    });
    it('GET all posts should return 200 and GET post by id should return post', async function () {
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [post4, post3, post2, post1],
        });

      const resultFoundPosts = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [post2, post1],
        });
      const foundPosts = resultFoundPosts.body;

      expect(foundPosts.items.length).toBe(2);

      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200, post1);
    });
    it('Ban blog should return 400 with incorrect data', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ isBanned: 123 })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('Ban blog should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .send({ isBanned: true })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('Ban blog should return 404', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${user1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ isBanned: true })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/sa/blogs/1/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ isBanned: true })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('Blog should be banned', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ isBanned: true })
        .expect(HTTP_Status.NO_CONTENT_204);

      let result = await request(app.getHttpServer())
        .get(`/sa/blogs?searchNameTerm=${blog1.name}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      blog1 = result.body.items[0];

      result = await request(app.getHttpServer())
        .get(`/sa/blogs?searchNameTerm=${blog2.name}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(blog2).toEqual(result.body.items[0]);
      expect(blog1).toEqual({ ...blog1, banInfo: { isBanned: true, banDate: expect.any(String) } });
    });
    it('GET Banned blog by id should return 404', async function () {
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('GET blogs should return all blogs without banned', async function () {
      const result = await request(app.getHttpServer()).get(`/blogs`).expect(HTTP_Status.OK_200);
      expect(result.body.items.length).toBe(2);
    });
    it('GET all posts should all posts without banned and GET banned post by id should return 404', async function () {
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [post4, post3],
        });

      await request(app.getHttpServer()).get(`/blogs/${blog1.id}/posts`).expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/${post3.id}`).expect(HTTP_Status.OK_200, post3);
    });
    it('Blog should be unbanned', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ isBanned: false })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/blogs?searchNameTerm=${blog1.name}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      blog1 = result.body.items[0];

      expect(blog1).toEqual({ ...blog1, banInfo: { isBanned: false, banDate: null } });
    });
    it('GET unbanned blog by id should return blog', async function () {
      const result = await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200);
      expect(blog1).not.toEqual(result.body);
    });
    it('GET blogs should return all blogs with unbanned', async function () {
      const result = await request(app.getHttpServer()).get(`/blogs`).expect(HTTP_Status.OK_200);
      expect(result.body.items.length).toBe(3);
    });
    it('GET all posts should return 200 and GET post by id should return post after unban blog', async function () {
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [post4, post3, post2, post1],
        });

      const resultFoundPosts = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [post2, post1],
        });
      const foundPosts = resultFoundPosts.body;

      expect(foundPosts.items.length).toBe(2);

      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200, post1);
    });
  });

  describe('Public-    blogs', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let blog3: BlogViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    it('Create and login 2 users', async function () {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;
    });
    it('GET blogs should return 200', async function () {
      await request(app.getHttpServer())
        .get('/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('Create 2 blog by user1 and 1 blog by user2', async () => {
      let result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: ' NEW NAME   ',
          description: 'description  ',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = result.body;

      expect(blog1).toEqual({
        id: expect.any(String),
        name: 'NEW NAME',
        description: 'description',
        websiteUrl: 'https://localhost1.uuu/blogs',
        createdAt: expect.any(String),
        isMembership: false,
      });
      result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'what name 2  ',
          description: 'adescription  2',
          websiteUrl: ' https://localhost1.uuu/blogs2  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog2 = result.body;

      result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          name: '  user2 blog  ',
          description: 'description  3',
          websiteUrl: ' https://localhost1.uuu/blogs3  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog3 = result.body;
    });
    it('GET blog by id should return blog', async function () {
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200, blog1);
    });
    it('GET blog by bad id should return 404', async function () {
      await request(app.getHttpServer()).get(`/blogs/1`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/blogs/63e35fa4354b26c3c099bd58`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('GET blogs should return 200', async function () {
      await request(app.getHttpServer())
        .get('/blogs')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog3, blog2, blog1],
        });
    });
    it('GET blogs with query should return 200', async function () {
      await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=name')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog2, blog1],
        });

      await request(app.getHttpServer())
        .get('/blogs?sortDirection=asc')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog1, blog2, blog3],
        });

      await request(app.getHttpServer())
        .get('/blogs?sortBy=description')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [blog3, blog1, blog2],
        });

      await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=name&pageSize=1')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 1,
          pageSize: 1,
          totalCount: 2,
          items: [blog2],
        });

      await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=name&pageSize=1&pageNumber=2')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 2,
          pageSize: 1,
          totalCount: 2,
          items: [blog1],
        });

      await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=2')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [blog3, blog2],
        });

      await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=new')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog1],
        });

      await request(app.getHttpServer()).get('/blogs?searchNameTerm=123').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });

  describe('Blogger and public-  posts', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let post1: PostViewModel;
    let post2: PostViewModel;
    let post3: PostViewModel;
    let post4: PostViewModel;
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    it('Create and login 2 users, create blog by user1', async function () {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;

      let resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = resultBlog.body;

      resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog2 = resultBlog.body;
    });
    it('GET should return 200', async function () {
      await request(app.getHttpServer()).get('/posts').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('GET By id should return 404', async function () {
      await request(app.getHttpServer()).get('/posts/1').expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/63e35fa4354b26c3c099bd58`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('POST shouldn`t create post with incorrect data', async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: '',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3mWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: '',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer()).get('/posts').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('POST shouldn`t create post with not exist blog', async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/1/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .post(`/blogger/blogs/63e35fa4354b26c3c099bd58/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get('/posts').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('POST shouldn`t create post if user try to add post to blog that does not belong to current user', async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('POST should create post with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post1 = result.body;

      expect(post1).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog1.id}`,
        blogName: `${blog1.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      });
    });
    it('POST should create 2 posts', async () => {
      let result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'cvalid2',
          content: 'valid2',
          shortDescription: 'K8cqY3aPKo3XW       OJyQgGnlX5sP3aW3RlaRSQx2',
        })
        .expect(HTTP_Status.CREATED_201);
      post2 = result.body;

      result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid3',
          content: 'valid3',
          shortDescription: 'K8cqY3aPKo3XWOJy    QgGnlX5sP3aW3RlaRSQx3',
        })
        .expect(HTTP_Status.CREATED_201);
      post3 = result.body;
    });
    it('GET post by id should return post', async function () {
      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200, post1);
    });
    it('GET posts should return 200', async function () {
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post2, post1],
        });

      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post2, post1],
        });
    });
    it('GET posts with query should return 200', async function () {
      await request(app.getHttpServer())
        .get('/posts?sortDirection=asc')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post1, post2, post3],
        });

      await request(app.getHttpServer())
        .get('/posts?sortBy=title')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post1, post2],
        });

      await request(app.getHttpServer())
        .get('/posts?pageSize=1')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 3,
          page: 1,
          pageSize: 1,
          totalCount: 3,
          items: [post3],
        });

      await request(app.getHttpServer())
        .get('/posts?searchNameTerm=name&pageSize=2&pageNumber=2')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 2,
          pageSize: 2,
          totalCount: 3,
          items: [post1],
        });
    });
    it('GET posts by BlogId with query should return 200', async function () {
      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts?sortDirection=asc`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post1, post2, post3],
        });

      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts?sortBy=title`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post1, post2],
        });

      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts?pageSize=1`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 3,
          page: 1,
          pageSize: 1,
          totalCount: 3,
          items: [post3],
        });

      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts?searchNameTerm=name&pageSize=2&pageNumber=2`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 2,
          page: 2,
          pageSize: 2,
          totalCount: 3,
          items: [post1],
        });
    });
    it('GET all posts for specific blog should return 200, after add new post to blog2 by user1', async function () {
      const result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid4',
          content: 'valid4',
          shortDescription: 'K8cqY3aPKo3XWOJy    QgGnlX5sP3aW3RlaRSQx4',
        })
        .expect(HTTP_Status.CREATED_201);
      post4 = result.body;

      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [post4, post3, post2, post1],
        });

      const resultFoundPosts = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post2, post1],
        });
      const foundPosts = resultFoundPosts.body;

      expect(foundPosts.items.length).toBe(3);
    });
    it('PUT shouldn`t update post with bad id', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}/posts/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}/posts/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/1/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${post1.id}/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT shouldn`t update post if user try to update post that belongs to blog that does not belong to current user', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('PUT should update blog with correct data', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
        })
        .expect(HTTP_Status.NO_CONTENT_204);
      const result = await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200);
      const updatedPost = result.body;
      expect(updatedPost).toEqual({
        id: expect.any(String),
        title: 'Update POST',
        content: 'Update content',
        blogId: `${blog1.id}`,
        blogName: `${blog1.name}`,
        shortDescription: 'Update shortDescription',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      });
      expect(updatedPost).not.toEqual(post1);
      post1 = updatedPost;
    });
    it('DELETE shouldn`t delete post with incorrect "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/636a2a16f394608b01446e12`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/1/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/636a2a16f394608b01446e12/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post3, post2, post1],
        });
    });
    it('DELETE shouldn`t delete post if user try to delete post that belongs to blog that does not belong to current user', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('DELETE should delete post with correct "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [post4, post3, post2],
        });

      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE shouldn`t delete post that is not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE blog should delete all posts of this blog', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}/posts`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/${post2.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
  });

  describe('SA-  users', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    it('GET should return 401 if admin Unauthorized', async function () {
      await request(app.getHttpServer()).get('/sa/users').expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET should return 200', async function () {
      await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('POST shouldn`t create user with incorrect data', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: '',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: '',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string12345.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('POST should create user with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = result.body;

      expect(user1).toEqual({
        id: expect.any(String),
        login: 'login',
        email: 'string2@sdf.ee',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
      await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [user1],
        });
    });
    it('POST shouldn`t create user with existed login', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: '1string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'Login',
          password: 'password',
          email: '2string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'LOGIN',
          password: 'password',
          email: '3string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST shouldn`t create user with existed email', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: '1login',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: '2login',
          password: 'password',
          email: 'STRING2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: '3login',
          password: 'password',
          email: 'String2@sdf.ee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: '3login',
          password: 'password',
          email: 'string2@sdf.EE',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('DELETE shouldn`t delete blog with incorrect "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/users/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/sa/users/636a2a16f394608b01446e12`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE should delete blog with correct "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/users/${user1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('GET users array with pagination after post 5 users should return 200', async function () {
      let result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string1@sdf.eqe',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = result.body;

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'loser',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      const user2 = result.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password',
          email: 'string3@sdf.eqe',
        })
        .expect(HTTP_Status.CREATED_201);

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'aSERaa',
          password: 'password',
          email: 'string4@sdf.eqe',
        })
        .expect(HTTP_Status.CREATED_201);
      const user4 = result.body;

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'zoker',
          password: 'password',
          email: 'string5@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      const user5 = result.body;

      await request(app.getHttpServer())
        .get(
          '/sa/users?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.ee&sortDirection=asc&sortBy=login',
        )
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 15,
          totalCount: 3,
          items: [user4, user2, user5],
        });
    });
  });

  describe('SA-  Ban User', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    let user2: UserViewModel;
    let user3: UserViewModel;
    let user4: UserViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let token3: LoginSuccessViewModel;
    let token4: LoginSuccessViewModel;
    let refreshToken: string;
    let comment1: CommentViewModel;
    let comment2: CommentViewModel;
    let comment3: CommentViewModel;
    let comment4: CommentViewModel;
    let post: PostViewModel;
    let blog: BlogViewModel;
    let newestLikes: [
      {
        addedAt: string;
        userId: string;
        login: string;
      },
    ];
    it('GET should return 200', async function () {
      await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('POST should create 4 users with correct data', async () => {
      let result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = result.body;

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password2',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user2 = result.body;

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password3',
          email: 'string3@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user3 = result.body;

      result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login4',
          password: 'password4',
          email: 'string4@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user4 = result.body;

      await request(app.getHttpServer())
        .get('/sa/users?sortBy=login&sortDirection=asc')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [user1, user2, user3, user4],
        });
    });
    it('PUT don`t ban user with incorrect data`s', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/1/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/sa/users/636a2a16f394608b01446e12/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/sa/users/${user1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: 'true',
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/sa/users/${user1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: 'true',
          banReason: 'banReason                                                      ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/sa/users/${user1.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          banReason: 'banReason',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('PUT ban user4', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user4.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?searchEmailTerm=${user4.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items[0].banInfo).toEqual({
        isBanned: true,
        banDate: expect.any(String),
        banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
      });
    });
    it('PUT unBan user4', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user4.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: false,
          banReason: null,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?searchEmailTerm=${user4.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items[0].banInfo).toEqual({
        isBanned: false,
        banDate: null,
        banReason: null,
      });
    });
    it('ban user3 and GET Ban users with query', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user3.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReason                    banReason',
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?banStatus=banned`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items).toEqual([
        {
          id: user3.id,
          email: user3.email,
          login: user3.login,
          createdAt: user3.createdAt,
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
            banReason: 'banReason                    banReason',
          },
        },
      ]);
      user3 = result.body.items[0];

      await request(app.getHttpServer())
        .get(`/sa/users?banStatus=banned&searchEmailTerm=${user4.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('GET unBan users with query', async function () {
      const result = await request(app.getHttpServer())
        .get(`/sa/users?banStatus=notBanned&sortBy=login&sortDirection=asc&searchEmailTerm=s&searchLoginTerm=login`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [user1, user2, user4],
      });

      await request(app.getHttpServer())
        .get(
          `/sa/users?banStatus=notBanned&sortBy=login&sortDirection=asc&searchEmailTerm=${user4.email}&searchLoginTerm=${user4.login}`,
        )
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [user4],
        });

      await request(app.getHttpServer())
        .get(
          `/sa/users?banStatus=notBanned&sortBy=login&sortDirection=asc&searchEmailTerm=${user3.email}&searchLoginTerm=${user3.login}`,
        )
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200, {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
    });
    it('GET all users with query', async function () {
      const result = await request(app.getHttpServer())
        .get(`/sa/users?banStatus=all&sortBy=login&sortDirection=asc&searchLoginTerm=login`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [user1, user2, user3, user4],
      });
    });
    it('Delete-all', async function () {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    it('POST should create blog, post and 4 auth users', async () => {
      let resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = resultUser.body;

      const resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password2',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user2 = resultUser.body;

      const resultToken2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password2',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken2.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password3',
          email: 'string3@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user3 = resultUser.body;

      const resultToken3 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login3',
          password: 'password3',
        })
        .expect(HTTP_Status.OK_200);
      token3 = resultToken3.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login4',
          password: 'password4',
          email: 'string4@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user4 = resultUser.body;

      const resultToken4 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login4',
          password: 'password4',
        })
        .expect(HTTP_Status.OK_200);
      token4 = resultToken4.body;
      refreshToken = resultToken4.headers['set-cookie'][0].split(';')[0].split('=')[1];

      const resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog = resultBlog.body;

      const resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post = resultPost.body;
    });
    it('POST should create comment by each users', async () => {
      let resultComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment_comment',
        })
        .expect(HTTP_Status.CREATED_201);
      comment1 = resultComment.body;

      resultComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment_comment2',
        })
        .expect(HTTP_Status.CREATED_201);
      comment2 = resultComment.body;

      resultComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment_comment3',
        })
        .expect(HTTP_Status.CREATED_201);
      comment3 = resultComment.body;

      resultComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment_comment4',
        })
        .expect(HTTP_Status.CREATED_201);
      comment4 = resultComment.body;

      await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [comment4, comment3, comment2, comment1],
        });
    });
    it('PUT ban  user4', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user4.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?searchEmailTerm=${user4.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items[0].banInfo).toEqual({
        isBanned: true,
        banDate: expect.any(String),
        banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
      });
    });
    it('Banned user can`t login and can`t get device list', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login4',
          password: 'password4',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);

      await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET should return 200 and comments without user4 comment', async () => {
      await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [comment3, comment2, comment1],
        });
    });
    it('PUT unBan  user4', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user4.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: false,
          banReason: null,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?searchEmailTerm=${user4.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items[0].banInfo).toEqual({
        isBanned: false,
        banDate: null,
        banReason: null,
      });
    });
    it('PUT should like comment by user2, user3 and dislike by user4, user1', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);

      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment1.id}`)
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 2,
          dislikesCount: 2,
          myStatus: LikeStatus.None,
        },
      });
    });
    it('PUT should like post by user2, user3 and dislike by user4, user1', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);

      const likedPost = await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 2,
          dislikesCount: 2,
          myStatus: LikeStatus.None,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
      newestLikes = likedPost.body.extendedLikesInfo.newestLikes;
    });
    it('PUT ban  user3', async function () {
      await request(app.getHttpServer())
        .put(`/sa/users/${user3.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .get(`/sa/users?searchEmailTerm=${user3.email}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.OK_200);

      expect(result.body.items[0].banInfo).toEqual({
        isBanned: true,
        banDate: expect.any(String),
        banReason: 'banReasonbanReasonbanReasonbanReasonbanReason',
      });
    });
    it('All likes of banned user shouldn`t returned and be counted for comment', async () => {
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment1.id}`)
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 2,
          myStatus: LikeStatus.None,
        },
      });
    });
    it('All likes of banned user shouldn`t returned and be counted for post', async () => {
      const likedPost = await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 2,
          myStatus: LikeStatus.None,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
      const newestLikes2 = likedPost.body.extendedLikesInfo.newestLikes;

      expect(newestLikes.length).toBe(2);
      expect(newestLikes2.length).toBe(1);
      expect(newestLikes).not.toEqual(newestLikes2);
    });
  });

  describe('/auth', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let validAccessToken: LoginSuccessViewModel, oldAccessToken: LoginSuccessViewModel;
    let refreshTokenKey: string, validRefreshToken: string, oldRefreshToken: string;
    it('POST shouldn`t authenticate user with incorrect data', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      await request(app.getHttpServer())
        .post('/auth/login')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          loginOrEmail: 'login',
          password: 'password3',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          loginOrEmail: '',
          password: 'password',
        })
        .expect(HTTP_Status.BAD_REQUEST_400)
        // await request(app.getHttpServer())
        //     .post('/auth/login')
        //     .auth('admin', 'qwerty', {type: 'basic'})
        //     .send({
        //         loginOrEmail: "login",
        //         password: "",
        //     })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/login')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          loginOrEmail: 'string2@sdf.eee',
          password: 'password',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('POST should authenticate user with correct login; content: AccessToken, RefreshToken in cookie (http only, secure)', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);

      await delay();
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true);
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true);
    });
    it('GET shouldn`t get data about user by bad token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(validAccessToken.accessToken + 'd', { type: 'bearer' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzcxMzkzNTQ5OTYxNWM1MTAwZGM5YjQiLCJpYXQiOjE2NjgzNjU0MDUsImV4cCI6MTY3NTAxODIwNX0.Mb02J2SwIzjfXVX0RIihvR1ioj-rcP0fVt3TQcY-BlY',
          { type: 'bearer' },
        )
        .expect(HTTP_Status.UNAUTHORIZED_401);

      await request(app.getHttpServer()).get('/auth/me').expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET should get data about user by token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(validAccessToken.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);
    });
    it.skip('GET shouldn`t get data about user when the AccessToken has expired', async () => {
      await delay(10000);

      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(validAccessToken.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    }, 15000);
    it.skip('POST should return an error when the "refresh" token has expired or there is no one in the cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh-token').expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', ``)
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}1`)
        .expect(HTTP_Status.UNAUTHORIZED_401);

      await delay(10000);
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    }, 15000);
    it('POST should authenticate user with correct email', async () => {
      //await delay(10000);
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'string2@sdf.ee',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(oldRefreshToken).not.toEqual(validRefreshToken);
    }, 15000);
    it('POST should return new tokens; content: AccessToken, RefreshToken in cookie (http only, secure)', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);
      //.expect('set-cookie', `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure`)

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(oldRefreshToken).not.toEqual(validRefreshToken);
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true);
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true);
    });
    it('POST shouldn`t return new tokens when "refresh" token in BL', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('POST should return new tokens 2', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(oldRefreshToken).not.toEqual(validRefreshToken);
    });
    it('POST shouldn`t logout user when "refresh" token in BL', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('POST should logout user', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NO_CONTENT_204);

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({});
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(validRefreshToken).toBe('');
    });
    it('POST shouldn`t logout user', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
  });

  describe('comments from post or /comments', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    let user2: UserViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let post1ForBlog1: PostViewModel;
    let post2ForBlog1: PostViewModel;
    let post1ForBlog2: PostViewModel;
    let post2ForBlog2: PostViewModel;
    let comment1: CommentViewModel;
    let comment2: CommentViewModel;
    let comment3: CommentViewModel;
    let comment4: CommentViewModel;
    let commentBl1: CommentViewModelBl;
    let commentBl2: CommentViewModelBl;
    let commentBl3: CommentViewModelBl;
    let commentBl4: CommentViewModelBl;
    it('Create and login 2 users, create 2 blogs & 2 posts in each blog by user1', async function () {
      let resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = resultUser.body;

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user2 = resultUser.body;

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;

      let resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName1',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = resultBlog.body;

      let resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post1ForBlog1',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post1ForBlog1 = resultPost.body;

      resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post2ForBlog1',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post2ForBlog1 = resultPost.body;

      resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName2',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog2 = resultBlog.body;

      resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post1ForBlog2',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post1ForBlog2 = resultPost.body;

      resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'post2ForBlog2',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post2ForBlog2 = resultPost.body;
    });
    it('POST shouldn`t create comment with incorrect data', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .send({ content: 'valid comment111111111' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      let result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'bad content' })
        .expect(HTTP_Status.BAD_REQUEST_400);
      checkError(result.body, 'content');

      result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content:
            'bad content11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      checkError(result.body, 'content');

      await request(app.getHttpServer())
        .post(`/posts/63189b06003380064c4193be/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'valid comment111111111' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('GET comments should return 404', async () => {
      await request(app.getHttpServer()).get(`/posts/${post1ForBlog1.id}/comments`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('POST should create comment with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.CREATED_201);
      comment1 = result.body;

      expect(comment1).toEqual({
        id: expect.any(String),
        content: 'valid comment111111111',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
    it('GET should return 200 and comments', async () => {
      await request(app.getHttpServer())
        .get(`/posts/${post1ForBlog1.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [comment1],
        });
    });
    it('GET should return 200 and found comment by id ', async () => {
      await request(app.getHttpServer()).get(`/comments/${comment1.id}`).expect(HTTP_Status.OK_200, comment1);
    });
    it('GET should return 404', async () => {
      await request(app.getHttpServer()).get(`/comments/1`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT shouldn`t update comment and return 400', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'bad content' })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content:
            'bad content111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('PUT shouldn`t update comment and return 401', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .send({ content: 'new content_new content' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('PUT shouldn`t update comment and return 404', async () => {
      await request(app.getHttpServer())
        .put(`/comments/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'new content!!!!!!!!!!!' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/comments/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'new content!!!!!!!!!!!' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT shouldn`t update comment and return 403', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ content: 'new content_new content' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('PUT should update comment', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ content: 'new content_new content' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const newComment = await request(app.getHttpServer()).get(`/comments/${comment1.id}`).expect(HTTP_Status.OK_200);

      expect(comment1).not.toEqual(newComment.body);
      expect(newComment.body.content).toBe('new content_new content');
      expect(comment1.content).not.toBe('new content_new content');
    });
    it('DELETE shouldn`t delete comment and return 401', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment1.id}`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('DELETE shouldn`t delete comment and return 404', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/comments/636a2a16f394608b01446e12`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE shouldn`t delete comment and return 403', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('DELETE should delete comment, after add 2 comments', async () => {
      let result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.CREATED_201);
      comment2 = result.body;

      result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.CREATED_201);
      comment3 = result.body;

      await request(app.getHttpServer())
        .delete(`/comments/${comment2.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer()).get(`/comments/${comment2.id}`).expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .delete(`/comments/${comment3.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer()).get(`/comments/${comment3.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE should return 404 if comments is already delete', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .delete(`/comments/${comment1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get(`/comments/${comment1.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('POST should create comments for each post by user2', async () => {
      let result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog1.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid       comment 1',
        })
        .expect(HTTP_Status.CREATED_201);
      comment1 = result.body;

      expect(comment1).toEqual({
        id: expect.any(String),
        content: 'valid       comment 1',
        commentatorInfo: {
          userId: user2.id,
          userLogin: user2.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });

      result = await request(app.getHttpServer())
        .post(`/posts/${post2ForBlog1.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid       comment 2',
        })
        .expect(HTTP_Status.CREATED_201);
      comment2 = result.body;

      result = await request(app.getHttpServer())
        .post(`/posts/${post1ForBlog2.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid       comment 3',
        })
        .expect(HTTP_Status.CREATED_201);
      comment3 = result.body;

      result = await request(app.getHttpServer())
        .post(`/posts/${post2ForBlog2.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid       comment 4',
        })
        .expect(HTTP_Status.CREATED_201);
      comment4 = result.body;

      await request(app.getHttpServer())
        .get(`/posts/${post1ForBlog1.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [comment1],
        });

      await request(app.getHttpServer())
        .get(`/posts/${post2ForBlog1.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [comment2],
        });

      await request(app.getHttpServer())
        .get(`/posts/${post1ForBlog2.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [comment3],
        });

      await request(app.getHttpServer())
        .get(`/posts/${post2ForBlog2.id}/comments`)
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [comment4],
        });

      commentBl1 = {
        id: comment1.id,
        content: comment1.content,
        commentatorInfo: comment1.commentatorInfo,
        createdAt: comment1.createdAt,
        postInfo: {
          id: post1ForBlog1.id,
          title: post1ForBlog1.title,
          blogId: post1ForBlog1.blogId,
          blogName: post1ForBlog1.blogName,
        },
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: LikeStatus.None },
      };

      commentBl2 = {
        id: comment2.id,
        content: comment2.content,
        commentatorInfo: comment2.commentatorInfo,
        createdAt: comment2.createdAt,
        postInfo: {
          id: post2ForBlog1.id,
          title: post2ForBlog1.title,
          blogId: post2ForBlog1.blogId,
          blogName: post2ForBlog1.blogName,
        },
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: LikeStatus.None },
      };

      commentBl3 = {
        id: comment3.id,
        content: comment3.content,
        commentatorInfo: comment3.commentatorInfo,
        createdAt: comment3.createdAt,
        postInfo: {
          id: post1ForBlog2.id,
          title: post1ForBlog2.title,
          blogId: post1ForBlog2.blogId,
          blogName: post1ForBlog2.blogName,
        },
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: LikeStatus.None },
      };

      commentBl4 = {
        id: comment4.id,
        content: comment4.content,
        commentatorInfo: comment4.commentatorInfo,
        createdAt: comment4.createdAt,
        postInfo: {
          id: post2ForBlog2.id,
          title: post2ForBlog2.title,
          blogId: post2ForBlog2.blogId,
          blogName: post2ForBlog2.blogName,
        },
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: LikeStatus.None },
      };
    });
    it('GET all comments by blogger should return 401', async () => {
      await request(app.getHttpServer()).get(`/blogger/blogs/comments`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET all comments by blogger should return all comments of blog with query', async () => {
      let result = await request(app.getHttpServer())
        .get(`/blogger/blogs/comments?sortDirection=asc`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [commentBl1, commentBl2, commentBl3, commentBl4],
      });

      result = await request(app.getHttpServer())
        .get(`/blogger/blogs/comments?pageSize=2&pageNumber=2`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
        totalCount: 4,
        items: [commentBl2, commentBl1],
      });

      result = await request(app.getHttpServer())
        .get(`/blogger/blogs/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });

  describe('Blogger-    ban user for blog', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    let user2: UserViewModel;
    let user3: UserViewModel;
    let user4: UserViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let post1: PostViewModel;
    let post2: PostViewModel;
    it('Create 4 users, login 2 users, create blog & post by users', async function () {
      let resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = resultUser.body;

      let resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user2 = resultUser.body;

      resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password',
          email: 'string3@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user3 = resultUser.body;

      resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login4',
          password: 'password',
          email: 'string4@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user4 = resultUser.body;

      let resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName1',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = resultBlog.body;

      let resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'postForBlog1',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post1 = resultPost.body;

      resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName2',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog2 = resultBlog.body;

      resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          title: 'postForBlog2',
          content: 'valid',
          shortDescription: 'shortDescription        shortDescription',
        })
        .expect(HTTP_Status.CREATED_201);
      post2 = resultPost.body;
    });
    it('GET comments should return 404', async () => {
      await request(app.getHttpServer()).get(`/posts/${post1.id}/comments`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('Ban User should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('Ban User2 should return 400 if data is incorrect', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: 'blog.id',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: 'yes',
          banReason: 'banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: user1.id,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('Ban User2 should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${post1.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('Ban User2 should return 404 if blog is not own', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'banReason         banReason',
          blogId: blog2.id,
        })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('Ban User2, user3 and user4 for blog', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: '2banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user3.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: '1banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .put(`/blogger/users/${user4.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: '3banReason         banReason',
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NO_CONTENT_204);
    });
    it('GET banned users should return 401', async () => {
      await request(app.getHttpServer()).get(`/blogger/users/blog/${blog1.id}`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('GET banned users return 403', async () => {
      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}`)
        .auth(token2.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);

      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog2.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('GET banned users return 404', async () => {
      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${user1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .get(`/blogger/users/blog/1`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('GET banned users  with query should return banned users', async () => {
      let result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: user4.id,
            login: user4.login,
            banInfo: {
              isBanned: true,
              banReason: '3banReason         banReason',
              banDate: expect.any(String),
            },
          },
          {
            id: user3.id,
            login: user3.login,
            banInfo: {
              isBanned: true,
              banReason: '1banReason         banReason',
              banDate: expect.any(String),
            },
          },
          {
            id: user2.id,
            login: user2.login,
            banInfo: {
              isBanned: true,
              banReason: '2banReason         banReason',
              banDate: expect.any(String),
            },
          },
        ],
      });

      result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}?pageSize=2&pageNumber=2&sortDirection=asc`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
        totalCount: 3,
        items: [
          {
            id: user4.id,
            login: user4.login,
            banInfo: {
              isBanned: true,
              banReason: '3banReason         banReason',
              banDate: expect.any(String),
            },
          },
        ],
      });

      result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}?sortBy=banReason`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: user4.id,
            login: user4.login,
            banInfo: {
              isBanned: true,
              banReason: '3banReason         banReason',
              banDate: expect.any(String),
            },
          },
          {
            id: user2.id,
            login: user2.login,
            banInfo: {
              isBanned: true,
              banReason: '2banReason         banReason',
              banDate: expect.any(String),
            },
          },
          {
            id: user3.id,
            login: user3.login,
            banInfo: {
              isBanned: true,
              banReason: '1banReason         banReason',
              banDate: expect.any(String),
            },
          },
        ],
      });

      result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}?searchLoginTerm=${user3.login}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: user3.id,
            login: user3.login,
            banInfo: {
              isBanned: true,
              banReason: '1banReason         banReason',
              banDate: expect.any(String),
            },
          },
        ],
      });
    });
    it('Banned by blogger user shouldn`t create comment in this blog, but can create comment in another blog', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${post1.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.FORBIDDEN_403);

      await request(app.getHttpServer())
        .post(`/posts/${post2.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.CREATED_201);
    });
    it('Unban User3 for blog', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user3.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: false,
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NO_CONTENT_204);
    });
    it('GET banned users should return user4 and user2', async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog1.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: user4.id,
            login: user4.login,
            banInfo: {
              isBanned: true,
              banReason: '3banReason         banReason',
              banDate: expect.any(String),
            },
          },
          {
            id: user2.id,
            login: user2.login,
            banInfo: {
              isBanned: true,
              banReason: '2banReason         banReason',
              banDate: expect.any(String),
            },
          },
        ],
      });
    });
    it('Unbanned by blogger user2 should create comment in this blog', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user2.id}/ban`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          isBanned: false,
          blogId: blog1.id,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      await request(app.getHttpServer())
        .post(`/posts/${post1.id}/comments`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment111111111',
        })
        .expect(HTTP_Status.CREATED_201);
    });
  });

  describe('/security', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let validAccessToken: LoginSuccessViewModel;
    let refreshTokenKey: string, validRefreshToken: string, oldRefreshToken: string;
    let devices: DeviceViewModel[];
    it('POST should authenticate user with correct data', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);

      await delay();
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      [refreshTokenKey] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true);
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true);
    });
    it('GET should get data about user by token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(validAccessToken.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);
    });
    it('POST should authenticate user +2 times', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);

      await delay();
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true);
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true);
    });
    it('GET should get device list', async () => {
      const result = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      devices = result.body;
      expect(devices).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
    });
    it('DELETE should return error if Id param not found', async () => {
      await request(app.getHttpServer())
        .delete('/security/devices/someId')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .delete('/security/devices/636a2a16f394608b01446e12')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('DELETE should return error if auth credentials is incorrect', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[0].deviceId}`)
        .set('Cookie', `refreshToken=${validRefreshToken}+1`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[0].deviceId}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);

      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${validRefreshToken}+1`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer()).delete(`/security/devices`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('DELETE should return error if access denied', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password2',
          email: 'string222@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password2',
        })
        .expect(HTTP_Status.OK_200);

      await delay();

      const refreshToken2 = result.headers['set-cookie'][0].split(';')[0].split('=')[1];

      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[1].deviceId}`)
        .set('Cookie', `refreshToken=${refreshToken2}`)
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('POST should not change deviceId after refresh-token, LastActiveDate should be changed', async function () {
      const result = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      await delay();
      expect(result.body).toEqual({ accessToken: expect.any(String) });
      expect(result.body).not.toEqual(validAccessToken);

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken');
      expect(oldRefreshToken).not.toEqual(validRefreshToken);
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true);
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true);

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body;
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
      expect(devices.map((d) => d.deviceId)).toEqual(newDeviceList.map((d) => d.deviceId));
      expect(devices.map((d) => d.lastActiveDate)).not.toEqual(newDeviceList.map((d) => d.lastActiveDate));
    });
    it('DELETE should delete device', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[1].deviceId}`)
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NO_CONTENT_204);

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body;
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
      expect(devices).not.toEqual(newDeviceList);
      devices = newDeviceList;
    });
    it('DELETE should delete devices', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NO_CONTENT_204);

      await delay();
      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body;
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
      expect(devices).not.toEqual(newDeviceList);
      devices = newDeviceList;
    });
    it('POST should logout device', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.NO_CONTENT_204);

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);

      await delay();

      expect(result.headers['set-cookie']).toBeTruthy();
      if (!result.headers['set-cookie']) return;

      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${validRefreshToken}`)
        .expect(HTTP_Status.OK_200);

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body;
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
      expect(devices).not.toEqual(newDeviceList);
    });
    it.skip('POST/registration should return status code 429 if more than 5 requests in 10 seconds, and 204 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.TOO_MANY_REQUESTS_429);

      await delay(10001);

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    }, 35000);
    it.skip('POST/login should return status code 429 if more than 5 requests in 10 seconds, and 401 after waiting ', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.TOO_MANY_REQUESTS_429);

      await delay(10000);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login0',
          password: 'password0',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    }, 15000);
    it.skip('POST/resending should return status code 429 if more than 5 requests in 10 seconds, and 400 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.TOO_MANY_REQUESTS_429);

      await delay(10000);

      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'stringx@sdf.eee',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    }, 15000);
    it.skip('POST/confirmation should return status code 429 if more than 5 requests in 10 seconds, and 400 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.TOO_MANY_REQUESTS_429);

      await delay(10000);

      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    }, 15000);
  });

  describe('comment likes', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let user1: UserViewModel;
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let token3: LoginSuccessViewModel;
    let token4: LoginSuccessViewModel;
    let comment: CommentViewModel;
    let post: PostViewModel;
    let blog: BlogViewModel;
    it('POST should create blog, post, comment and 4 auth users', async () => {
      const resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);
      user1 = resultUser.body;

      const resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password2',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password2',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken2.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password3',
          email: 'string3@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken3 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login3',
          password: 'password3',
        })
        .expect(HTTP_Status.OK_200);
      token3 = resultToken3.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login4',
          password: 'password4',
          email: 'string4@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken4 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login4',
          password: 'password4',
        })
        .expect(HTTP_Status.OK_200);
      token4 = resultToken4.body;

      const resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog = resultBlog.body;

      const resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post = resultPost.body;

      const resultComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          content: 'valid comment_comment',
        })
        .expect(HTTP_Status.CREATED_201);
      comment = resultComment.body;

      expect(comment).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
    it('PUT shouldn`t like comment and return 401', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('PUT shouldn`t like comment and return 400', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'ErrorStatus' })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('PUT shouldn`t like comment and return 404', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${blog.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer())
        .put(`/comments/1/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT should like comment by user1', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(comment).not.toEqual(likedComment.body);
      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });
    it('GET should return 200 and comments with "myStatus": "None" for non auth user', async () => {
      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(HTTP_Status.OK_200, {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: user1.id,
            userLogin: user1.login,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: 'None',
          },
        });
    });
    it('PUT should like comment by user2, user3 and dislike by user4 with get comment by him', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(token4.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          myStatus: 'Dislike',
        },
      });
    });
    it('GET should return 200 and comments with "myStatus": "None" for non auth user', async () => {
      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(HTTP_Status.OK_200, {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: user1.id,
            userLogin: user1.login,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: 3,
            dislikesCount: 1,
            myStatus: 'None',
          },
        });
    });
    it('PUT should dislike comment by user2, user3 and like by user4 with get comment by him', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(token4.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 2,
          dislikesCount: 2,
          myStatus: 'Like',
        },
      });
    });
    it('PUT should dislike comment by user1 twice. Shouldn`t increase likes count', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 3,
          myStatus: 'Dislike',
        },
      });
    });
    it('PUT should set None status all users with get comment by user1', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedComment = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(token4.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedComment.body).toEqual({
        id: expect.any(String),
        content: 'valid comment_comment',
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
    it(
      'create +5 comments then:' +
        ' like comment 1 by user 1, user 2;' +
        ' like comment 2 by user 2, user 3;' +
        ' dislike comment 3 by user 1;' +
        ' like comment 4 by user 1, user 4, user 2, user 3;' +
        ' like comment 5 by user 2, dislike by user 3;' +
        ' like comment 6 by user 1, dislike by user 2.' +
        ' Get the comments by user 1 after all likes',
      async () => {
        let resultComment = await request(app.getHttpServer())
          .post(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            content: 'valid comment_comment2',
          })
          .expect(HTTP_Status.CREATED_201);
        const comment2 = { ...resultComment.body };

        resultComment = await request(app.getHttpServer())
          .post(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            content: 'valid comment_comment3',
          })
          .expect(HTTP_Status.CREATED_201);
        const comment3 = { ...resultComment.body };

        resultComment = await request(app.getHttpServer())
          .post(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            content: 'valid comment_comment4',
          })
          .expect(HTTP_Status.CREATED_201);
        const comment4 = { ...resultComment.body };

        resultComment = await request(app.getHttpServer())
          .post(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            content: 'valid comment_comment5',
          })
          .expect(HTTP_Status.CREATED_201);
        const comment5 = { ...resultComment.body };

        resultComment = await request(app.getHttpServer())
          .post(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            content: 'valid comment_comment6',
          })
          .expect(HTTP_Status.CREATED_201);
        const comment6 = { ...resultComment.body };

        await request(app.getHttpServer())
          .put(`/comments/${comment.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/comments/${comment2.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment2.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/comments/${comment3.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/comments/${comment4.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment4.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment4.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment4.id}/like-status`)
          .auth(token4.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/comments/${comment5.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment5.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/comments/${comment6.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/comments/${comment6.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        const result = await request(app.getHttpServer())
          .get(`/posts/${post.id}/comments`)
          .auth(token1.accessToken, { type: 'bearer' })
          .expect(HTTP_Status.OK_200);

        expect(result.body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 6,
          items: [
            {
              id: comment6.id,
              content: comment6.content,
              commentatorInfo: {
                userId: comment6.commentatorInfo.userId,
                userLogin: comment6.commentatorInfo.userLogin,
              },
              createdAt: comment6.createdAt,
              likesInfo: {
                likesCount: 1,
                dislikesCount: 1,
                myStatus: 'Like',
              },
            },
            {
              id: comment5.id,
              content: comment5.content,
              commentatorInfo: {
                userId: comment5.commentatorInfo.userId,
                userLogin: comment5.commentatorInfo.userLogin,
              },
              createdAt: comment5.createdAt,
              likesInfo: {
                likesCount: 1,
                dislikesCount: 1,
                myStatus: 'None',
              },
            },
            {
              id: comment4.id,
              content: comment4.content,
              commentatorInfo: {
                userId: comment4.commentatorInfo.userId,
                userLogin: comment4.commentatorInfo.userLogin,
              },
              createdAt: comment4.createdAt,
              likesInfo: {
                likesCount: 4,
                dislikesCount: 0,
                myStatus: 'Like',
              },
            },
            {
              id: comment3.id,
              content: comment3.content,
              commentatorInfo: {
                userId: comment3.commentatorInfo.userId,
                userLogin: comment3.commentatorInfo.userLogin,
              },
              createdAt: comment3.createdAt,
              likesInfo: {
                likesCount: 0,
                dislikesCount: 1,
                myStatus: 'Dislike',
              },
            },
            {
              id: comment2.id,
              content: comment2.content,
              commentatorInfo: {
                userId: comment2.commentatorInfo.userId,
                userLogin: comment2.commentatorInfo.userLogin,
              },
              createdAt: comment2.createdAt,
              likesInfo: {
                likesCount: 2,
                dislikesCount: 0,
                myStatus: 'None',
              },
            },
            {
              id: comment.id,
              content: comment.content,
              commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
              },
              createdAt: comment.createdAt,
              likesInfo: {
                likesCount: 2,
                dislikesCount: 0,
                myStatus: 'Like',
              },
            },
          ],
        });
        //
        // expect(likedComment.body).toEqual(
        //     {
        //         id: expect.any(String),
        //         content: "valid comment111111111",
        //         userId: user.id,
        //         userLogin: user.login,
        //         createdAt: expect.any(String),
        //         likesInfo: {
        //             "likesCount": 0,
        //             "dislikesCount": 0,
        //             "myStatus": "None"
        //         }
        //     }
        //)
      },
    );
  });

  describe('post likes', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let token1: LoginSuccessViewModel;
    let token2: LoginSuccessViewModel;
    let token3: LoginSuccessViewModel;
    let token4: LoginSuccessViewModel;
    let post: PostViewModel;
    let blog: BlogViewModel;
    it('POST should create blog, post and 4 auth users', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login',
          password: 'password',
          email: 'string@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
      token1 = resultToken.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login2',
          password: 'password2',
          email: 'string2@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login2',
          password: 'password2',
        })
        .expect(HTTP_Status.OK_200);
      token2 = resultToken2.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login3',
          password: 'password3',
          email: 'string3@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken3 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login3',
          password: 'password3',
        })
        .expect(HTTP_Status.OK_200);
      token3 = resultToken3.body;

      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'login4',
          password: 'password4',
          email: 'string4@sdf.ee',
        })
        .expect(HTTP_Status.CREATED_201);

      const resultToken4 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'login4',
          password: 'password4',
        })
        .expect(HTTP_Status.OK_200);
      token4 = resultToken4.body;

      const resultBlog = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog = resultBlog.body;

      const resultPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({
          title: 'valid',
          content: 'valid',
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post = resultPost.body;

      expect(post).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      });
    });
    it('PUT shouldn`t like post and return 401', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken + 'd', { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('PUT shouldn`t like post and return 400', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'ErrorStatus' })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('PUT shouldn`t like post and return 404', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${blog.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT should like post by user1', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedPost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(post).not.toEqual(likedPost.body);
      post = likedPost.body;
      expect(post).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ],
        },
      });
    });
    it('GET should return 200 and post with "myStatus": "None" for non auth user', async () => {
      await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(HTTP_Status.OK_200, {
          id: post.id,
          title: 'valid',
          content: 'valid',
          blogId: `${blog.id}`,
          blogName: `${blog.name}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: post.extendedLikesInfo.newestLikes,
          },
        });
    });
    it('PUT should like post by user2, user3 and dislike by user4 with get post by him', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedPost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(token4.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          myStatus: LikeStatus.Dislike,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
    });
    it('GET2 should return 200 and post with "myStatus": "None" for non auth user', async () => {
      const result = await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(HTTP_Status.OK_200);

      expect(result.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          myStatus: LikeStatus.None,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
    });
    it('PUT should dislike post by user2, user3 and like by user4 with get post by him', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedPost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(token4.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 2,
          dislikesCount: 2,
          myStatus: LikeStatus.Like,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
    });
    it('PUT should dislike post by user1 twice. Shouldn`t increase likes count', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Dislike' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedPost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 3,
          myStatus: LikeStatus.Dislike,
          newestLikes: expect.arrayContaining([
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: expect.any(String),
            },
          ]),
        },
      });
    });
    it('PUT should set None status all users with get post by user1', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token1.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token2.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token3.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(token4.accessToken, { type: 'bearer' })
        .send({ likeStatus: 'None' })
        .expect(HTTP_Status.NO_CONTENT_204);
      const likedPost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(token1.accessToken, { type: 'bearer' })
        .expect(HTTP_Status.OK_200);

      expect(likedPost.body).toEqual({
        id: expect.any(String),
        title: 'valid',
        content: 'valid',
        blogId: `${blog.id}`,
        blogName: `${blog.name}`,
        shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      });
    });
    it(
      'create +5 posts then:' +
        ' like post 1 by user 1, user 2;' +
        ' like post 2 by user 2, user 3;' +
        ' dislike post 3 by user 1;' +
        ' like post 4 by user 1, user 4, user 2, user 3;' +
        ' like post 5 by user 2, dislike by user 3;' +
        ' like post 6 by user 1, dislike by user 2.' +
        ' Get the posts by user 1 after all likes',
      async () => {
        let likedPost = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blog.id}/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            title: 'valid2',
            content: 'valid2',
            shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          })
          .expect(HTTP_Status.CREATED_201);
        const post2 = { ...likedPost.body };

        likedPost = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blog.id}/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            title: 'valid3',
            content: 'valid3',
            shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          })
          .expect(HTTP_Status.CREATED_201);
        const post3 = { ...likedPost.body };

        likedPost = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blog.id}/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            title: 'valid4',
            content: 'valid4',
            shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          })
          .expect(HTTP_Status.CREATED_201);
        const post4 = { ...likedPost.body };

        likedPost = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blog.id}/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            title: 'valid5',
            content: 'valid5',
            shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          })
          .expect(HTTP_Status.CREATED_201);
        const post5 = { ...likedPost.body };

        likedPost = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blog.id}/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({
            title: 'valid6',
            content: 'valid6',
            shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
          })
          .expect(HTTP_Status.CREATED_201);
        const post6 = { ...likedPost.body };

        await request(app.getHttpServer())
          .put(`/posts/${post.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/posts/${post2.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post2.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/posts/${post3.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/posts/${post4.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post4.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post4.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post4.id}/like-status`)
          .auth(token4.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/posts/${post5.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post5.id}/like-status`)
          .auth(token3.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        await request(app.getHttpServer())
          .put(`/posts/${post6.id}/like-status`)
          .auth(token1.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Like' })
          .expect(HTTP_Status.NO_CONTENT_204);
        await request(app.getHttpServer())
          .put(`/posts/${post6.id}/like-status`)
          .auth(token2.accessToken, { type: 'bearer' })
          .send({ likeStatus: 'Dislike' })
          .expect(HTTP_Status.NO_CONTENT_204);

        const result = await request(app.getHttpServer())
          .get(`/posts`)
          .auth(token1.accessToken, { type: 'bearer' })
          .expect(HTTP_Status.OK_200);

        expect(result.body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 6,
          items: [
            {
              id: post6.id,
              title: post6.title,
              content: post6.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post6.shortDescription,
              createdAt: post6.createdAt,
              extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 1,
                myStatus: LikeStatus.Like,
                newestLikes: expect.arrayContaining([
                  {
                    addedAt: expect.any(String),
                    userId: expect.any(String),
                    login: expect.any(String),
                  },
                ]),
              },
            },
            {
              id: post5.id,
              title: post5.title,
              content: post5.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post5.shortDescription,
              createdAt: post5.createdAt,
              extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 1,
                myStatus: LikeStatus.None,
                newestLikes: expect.arrayContaining([
                  {
                    addedAt: expect.any(String),
                    userId: expect.any(String),
                    login: expect.any(String),
                  },
                ]),
              },
            },
            {
              id: post4.id,
              title: post4.title,
              content: post4.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post4.shortDescription,
              createdAt: post4.createdAt,
              extendedLikesInfo: {
                likesCount: 4,
                dislikesCount: 0,
                myStatus: LikeStatus.Like,
                newestLikes: expect.arrayContaining([
                  {
                    addedAt: expect.any(String),
                    userId: expect.any(String),
                    login: expect.any(String),
                  },
                ]),
              },
            },
            {
              id: post3.id,
              title: post3.title,
              content: post3.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post3.shortDescription,
              createdAt: post3.createdAt,
              extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 1,
                myStatus: LikeStatus.Dislike,
                newestLikes: [],
              },
            },
            {
              id: post2.id,
              title: post2.title,
              content: post2.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post2.shortDescription,
              createdAt: post2.createdAt,
              extendedLikesInfo: {
                likesCount: 2,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: expect.arrayContaining([
                  {
                    addedAt: expect.any(String),
                    userId: expect.any(String),
                    login: expect.any(String),
                  },
                ]),
              },
            },
            {
              id: post.id,
              title: post.title,
              content: post.content,
              blogId: `${blog.id}`,
              blogName: `${blog.name}`,
              shortDescription: post.shortDescription,
              createdAt: post.createdAt,
              extendedLikesInfo: {
                likesCount: 2,
                dislikesCount: 0,
                myStatus: LikeStatus.Like,
                newestLikes: expect.arrayContaining([
                  {
                    addedAt: expect.any(String),
                    userId: expect.any(String),
                    login: expect.any(String),
                  },
                ]),
              },
            },
          ],
        });
      },
    );
  });

  describe('registration', () => {
    let confirmationCode: string;
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    it('POST should create user and send email', async () => {
      const emailAdapter = app.get<EmailAdapter>(EmailAdapter);
      jest.spyOn(emailAdapter, 'sendEmail');

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: process.env.MY_EMAIL,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      expect(emailAdapter.sendEmail).toBeCalled();
    });
    it('POST shouldn`t create user with valid login or email', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser',
          password: 'password',
          email: 'test1@test.it',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser2',
          password: 'password',
          email: process.env.MY_EMAIL,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'NewUser2',
          password: '',
          email: 'test2@test.it',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST should resend email', async () => {
      const emailService = app.get<EmailService>(EmailService);
      const sendEmailConfirmationMessage = jest.spyOn(emailService, 'sendEmailConfirmationMessage');
      const emailAdapter = app.get<EmailAdapter>(EmailAdapter);
      jest.spyOn(emailAdapter, 'sendEmail');

      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: process.env.MY_EMAIL,
        })
        .expect(HTTP_Status.NO_CONTENT_204);

      expect(emailAdapter.sendEmail).toBeCalled();
      confirmationCode = sendEmailConfirmationMessage.mock.lastCall[1];
    });
    it('POST shouldn`t resend email', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'test1@test.it',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST shouldn`t confirm registration because code is old', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: 'test',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('shouldn`t authenticate not confirmed user ', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'NewUser',
          password: 'password',
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('POST should confirm registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: confirmationCode,
        }) // add "emailConfirmation.confirmationCode = 'testres'" to auth.service methods: createUser, passwordRecoverySendEmail, registrationResendEmail
        .expect(HTTP_Status.NO_CONTENT_204);
    });
    it('should authenticate confirmed user ', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'NewUser',
          password: 'password',
        })
        .expect(HTTP_Status.OK_200);
    });
    it('POST shouldn`t confirm registration if already confirm', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: 'test',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST shouldn`t confirm registration if valid code', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: '6',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('POST shouldn`t resend email if registration already confirmed', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: process.env.MY_EMAIL,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('get 1 user', async () => {
      const users = await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: 'NewUser',
            email: process.env.MY_EMAIL,
            createdAt: expect.any(String),
            banInfo: {
              banDate: null,
              banReason: null,
              isBanned: false,
            },
          },
        ],
      });
    });
  });
});
