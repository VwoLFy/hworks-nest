import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HTTP_Status, LikeStatus } from '../src/main/types/enums';
import { BlogViewModel } from '../src/blogs/api/models/BlogViewModel';
import { HttpExceptionFilter } from '../src/exception.filter';
import { PostViewModel } from '../src/posts/api/models/PostViewModel';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors();
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const err = errors.map((e) => ({
            field: e.property,
            message: Object.values(e.constraints).toString(),
          }));
          throw new HttpException(err, HTTP_Status.BAD_REQUEST_400);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });
  afterAll(async () => {
    await app.close();
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
          name: 1,
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
          websiteUrl: 1,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 1,
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);

      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 1,
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
          websiteUrl: 1,
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 1,
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'a'.repeat(16),
          description: 'description',
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
      await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'valid name',
          description: 'description',
          websiteUrl: 'https://localhost1.uuu/blogs' + 'a'.repeat(100),
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
    it('GET blog by id should return 200', async function () {
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.OK_200, blog1);
    });
    it('GET blog by bad id should return 404', async function () {
      await request(app.getHttpServer()).get(`/blogs/1`).expect(HTTP_Status.NOT_FOUND_404);
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

  describe('/posts', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let post1: PostViewModel;
    let post2: PostViewModel;
    let post3: PostViewModel;
    let blog1: BlogViewModel;
    it('GET should return 200', async function () {
      await request(app.getHttpServer()).get('/posts').expect(HTTP_Status.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('GET By Id should return 404', async function () {
      await request(app.getHttpServer()).get('/posts/1').expect(HTTP_Status.NOT_FOUND_404);
    });
    it('POST shouldn`t create post with incorrect data', async () => {
      const result = await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      blog1 = result.body;

      await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: '',
          content: 'valid',
          blogId: `${blog1.id}`,
          shortDescription: 'K8cqY3aPKo3mWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: '',
          blogId: `${blog1.id}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `1`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `${blog1.id}`,
          shortDescription: '',
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
    it('POST should create post with correct data', async () => {
      const result = await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `${blog1.id}`,
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
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [post1],
        });
    });
    it('PUT shouldn`t update blog with incorrect "name"', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: '',
          content: 'valid',
          blogId: `${blog1.id}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: '',
          blogId: `${blog1.id}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `/posts/1`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `/posts/${blog1.id}`,
          shortDescription: '',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
      await request(app.getHttpServer())
        .put(`/posts/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `/posts/${blog1.id}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('PUT should update blog with correct data', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'Update POST',
          shortDescription: 'Update shortDescription',
          content: 'Update content',
          blogId: `${blog1.id}`,
        })
        .expect(HTTP_Status.NO_CONTENT_204);
      const result = await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200);
      post2 = result.body;
      expect(post2).toEqual({
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
      expect(post2).not.toEqual(post1);
    });
    it('GET all posts for bad blog should return 404', async function () {
      await request(app.getHttpServer()).get(`/blogs/1/posts`).expect(HTTP_Status.NOT_FOUND_404);
    });
    it('POST should create post for new blog', async () => {
      const resultBlog = await request(app.getHttpServer())
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          name: 'blogName',
          description: 'description',
          websiteUrl: ' https://localhost1.uuu/blogs  ',
        })
        .expect(HTTP_Status.CREATED_201);
      const blog2 = resultBlog.body;

      const resultPost = await request(app.getHttpServer())
        .post(`/blogs/${blog2.id}/posts`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid',
          content: 'valid',
          blogId: `${blog2.id}`,
          shortDescription: 'K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post3 = resultPost.body;

      expect(post3.blogId).toBe(blog2.id);
    });
    it('GET all posts for specific blog should return 200', async function () {
      const result = await request(app.getHttpServer()).get(`/blogs/${blog1.id}/posts`).expect(HTTP_Status.OK_200);
      const result2 = await request(app.getHttpServer()).get(`/blogs/${blog1.id}/posts`).expect(HTTP_Status.OK_200);

      expect(result.body.items.length).toBe(1);
      expect(result2.body.items.length).toBe(1);
    });
    it('GET2 should return 200', async function () {
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [post3, post2],
        });
    });

    it('DELETE shouldn`t delete blog with incorrect "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);

      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.OK_200, post2);
    });
    it('DELETE should delete blog with correct "id"', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${post1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer())
        .get('/posts')
        .expect(HTTP_Status.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [post3],
        });
    });
    it('DELETE blog should delete all posts of this blog', async () => {
      const result1 = await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid1',
          content: 'valid1',
          blogId: `${blog1.id}`,
          shortDescription: '1 K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post1 = result1.body;

      const result2 = await request(app.getHttpServer())
        .post('/posts')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          title: 'valid2',
          content: 'valid2',
          blogId: `${blog1.id}`,
          shortDescription: '2 K8cqY3aPKo3XWOJyQgGnlX5sP3aW3RlaRSQx',
        })
        .expect(HTTP_Status.CREATED_201);
      post2 = result2.body;

      await request(app.getHttpServer())
        .delete(`/blogs/${blog1.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NO_CONTENT_204);
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/blogs/${blog1.id}/posts`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/${post1.id}`).expect(HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer()).get(`/posts/${post2.id}`).expect(HTTP_Status.NOT_FOUND_404);
    });
  });
});
