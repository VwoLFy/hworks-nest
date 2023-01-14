import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HTTP_Status } from '../src/main/types/enums';
import { BlogViewModel } from '../src/blogs/api/models/BlogViewModel';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterAll(() => {
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  describe('/blogs', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    it('GET should return 200', async function () {
      await request(app.getHttpServer()).get('/blogs').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('POST shouldn`t create blog with incorrect "data"', async () => {
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: '    ',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: ' htt://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: '        ',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 'a'.repeat(501),
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer()).get('/blogs').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('POST should create blog with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: ' NEW NAME   ',
          description: 'description',
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
      });
      await request(app.getHttpServer())
        .get('/blogs')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [blog1],
        });
    });
    it('PUT shouldn`t update blog with incorrect data', async () => {
      await request(app.getHttpServer())
        .put(`/blogs/${blog1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: '    ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/blogs/${blog1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 'Updating description',
          websiteUrl: 'http://api-swagger.it-incubator',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/blogs/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('PUT should update blog with correct data', async () => {
      await request(app.getHttpServer())
        .put(`/blogs/${blog1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: ' Updating NAME   ',
          description: 'Updating description',
          websiteUrl: 'https://api-swagger.it-incubator.ru/',
        })
        .expect(HTTP_Status.NO_CONTENT_204);
      const result = await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200);
      blog2 = result.body;

      expect(blog2).toEqual({
        id: expect.any(String),
        name: 'Updating NAME',
        description: 'Updating description',
        websiteUrl: 'https://api-swagger.it-incubator.ru/',
        createdAt: expect.any(String),
      });
      expect(blog2).not.toEqual(blog1);
    });
    it('DELETE shouldn`t delete blog with incorrect "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogs/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200, blog2);
    });
    it('DELETE should delete blog with correct "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/blogs/${blog1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer()).get('/blogs').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });
});
