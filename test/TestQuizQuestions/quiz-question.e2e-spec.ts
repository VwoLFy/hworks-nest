import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { QuestionViewModel } from '../../src/modules/quiz-questions/api/models/QuestionViewModel';
import { UpdateQuestionDto } from '../../src/modules/quiz-questions/application/dto/UpdateQuestionDto';
import { TestQuizQuestions } from './TestQuizQuestions';
import { testCreateApp } from '../Utils/TestCreateApp';

describe('quiz questions (e2e)', () => {
  let app: INestApplication;
  let testQuizQuestions: TestQuizQuestions;

  beforeAll(async () => {
    app = await testCreateApp();
    testQuizQuestions = new TestQuizQuestions(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('quiz questions', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let question: QuestionViewModel;
    let question2: QuestionViewModel;
    let question3: QuestionViewModel;
    let question4: QuestionViewModel;
    it('get questions error 401 if admin Unauthorized ', async () => {
      await request(app.getHttpServer())
        .get(`/sa/quiz/questions?bodySearchTerm=vvv`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('get questions should return empty page', async () => {
      const pageQuestions = await testQuizQuestions.findQuestions();
      expect(pageQuestions).toEqual({
        page: 1,
        pagesCount: 0,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('shouldn`t create question if admin Unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .send({
          body: 'string12345',
          correctAnswers: ['1'],
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('shouldn`t create question with bad data', async () => {
      let body;
      body = {
        body: 'bad str',
        correctAnswers: ['1'],
      };
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = '               bad str';
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'body');

      delete body.body;
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = 1;
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = 'a'.repeat(501);
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'body');

      body = {
        body: 'valid body',
        correctAnswers: 1,
      };
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      delete body.correctAnswers;
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = '1';
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [1];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = ['       '];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [true];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = null;
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [null];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [{ id: '123' }];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [['123']];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [1, true, '123', {}, ['123']];
      await testQuizQuestions.createQuestion(body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');
    });
    it('create question', async () => {
      const body = {
        body: 'How many minutes in hour?',
        correctAnswers: ['   60', 'sixty', '   6ty    '],
      };
      const expectedQuestion = {
        id: expect.any(String),
        body: body.body,
        correctAnswers: ['60', 'sixty', '6ty'],
        createdAt: expect.any(String),
        published: false,
        updatedAt: null,
      };

      question = await testQuizQuestions.createQuestion(body);
      expect(question).toEqual(expectedQuestion);
    });
    it('create 3 questions and then get they with query', async () => {
      question2 = await testQuizQuestions.createQuestion({
        body: 'Which drink is commonly associated with Czech?',
        correctAnswers: ['beer'],
      });
      question3 = await testQuizQuestions.createQuestion({
        body: 'What sport did David Beckham play?',
        correctAnswers: ['football'],
      });
      question4 = await testQuizQuestions.createQuestion({
        body: 'What’s longer, a nautical mile or a mile?',
        correctAnswers: ['nautical mile', 'nautical'],
      });

      let pageQuestions = await testQuizQuestions.findQuestions();
      expect(pageQuestions).toEqual({
        page: 1,
        pagesCount: 1,
        pageSize: 10,
        totalCount: 4,
        items: [question4, question3, question2, question],
      });

      pageQuestions = await testQuizQuestions.findQuestions(`pageNumber=2&pageSize=3&publishedStatus=notPublished`);
      expect(pageQuestions).toEqual({
        page: 2,
        pagesCount: 2,
        pageSize: 3,
        totalCount: 4,
        items: [question],
      });

      pageQuestions = await testQuizQuestions.findQuestions(
        `pageNumber=asd&pageSize=fsa&publishedStatus=67notPublished&sortBy=body&sortDirection=asc`,
      );
      expect(pageQuestions).toEqual({
        page: 1,
        pagesCount: 1,
        pageSize: 10,
        totalCount: 4,
        items: [question, question3, question4, question2],
      });

      pageQuestions = await testQuizQuestions.findQuestions(`bodySearchTerm=whAT&&sortDirection=asc`);
      expect(pageQuestions).toEqual({
        page: 1,
        pagesCount: 1,
        pageSize: 10,
        totalCount: 2,
        items: [question3, question4],
      });
    });
    it('delete shouldn`t delete question if admin Unauthorized', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${question4.id}`)
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('delete shouldn`t delete question with bad id', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('delete question4', async () => {
      await testQuizQuestions.deleteQuestion(question4.id);

      const pageQuestions = await testQuizQuestions.findQuestions();
      expect(pageQuestions).toEqual({
        page: 1,
        pagesCount: 1,
        pageSize: 10,
        totalCount: 3,
        items: [question3, question2, question],
      });
    });
    it('delete shouldn`t delete not exist question', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${question4.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('publish shouldn`t publish question with bad data 400', async () => {
      let dto;
      dto = { published: null };
      await testQuizQuestions.publishQuestion(question.id, dto, HTTP_Status.BAD_REQUEST_400, 'published');

      dto = { published: 'null' };
      await testQuizQuestions.publishQuestion(question.id, dto, HTTP_Status.BAD_REQUEST_400, 'published');

      dto = { published: 0 };
      await testQuizQuestions.publishQuestion(question.id, dto, HTTP_Status.BAD_REQUEST_400, 'published');

      dto = null;
      await testQuizQuestions.publishQuestion(question.id, dto, HTTP_Status.BAD_REQUEST_400, 'published');
    });
    it('publish shouldn`t publish question with bad questionId', async () => {
      await testQuizQuestions.publishQuestion(question4.id, { published: true }, HTTP_Status.NOT_FOUND_404);
      await testQuizQuestions.publishQuestion('1', { published: true }, HTTP_Status.BAD_REQUEST_400);
    });
    it('publish shouldn`t publish question if admin Unauthorized', async () => {
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${question.id}/publish`)
        .send({ published: true })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('publish should publish question', async () => {
      await testQuizQuestions.publishQuestion(question.id, { published: true });

      const updatedQuestion = (await testQuizQuestions.findQuestions(`bodySearchTerm=${question.body}`)).items[0];
      expect(updatedQuestion).toEqual({ ...question, published: true, updatedAt: expect.any(String) });
      expect(question.updatedAt).not.toEqual(updatedQuestion.updatedAt);
      question = updatedQuestion;
    });
    it('should unpublish question', async () => {
      await testQuizQuestions.publishQuestion(question.id, { published: false });

      const updatedQuestion = (await testQuizQuestions.findQuestions(`bodySearchTerm=${question.body}`)).items[0];
      expect(updatedQuestion).toEqual({ ...question, published: false, updatedAt: expect.any(String) });
      expect(question.updatedAt).not.toEqual(updatedQuestion.updatedAt);
      question = updatedQuestion;
    });
    it('update shouldn`t update question if admin Unauthorized', async () => {
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${question.id}`)
        .send({
          body: 'string12345',
          correctAnswers: ['1'],
        })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('update shouldn`t update question with bad data', async () => {
      let body;
      body = {
        body: 'bad str',
        correctAnswers: ['1'],
      };
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = '               bad str';
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'body');

      delete body.body;
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = 1;
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'body');

      body.body = 'a'.repeat(501);
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'body');

      body = {
        body: 'valid body',
        correctAnswers: 1,
      };
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      delete body.correctAnswers;
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = '1';
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [1];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = ['       '];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [true];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = null;
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [null];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [{ id: '123' }];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [['123']];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');

      body.correctAnswers = [1, true, '123', {}, ['123']];
      await testQuizQuestions.updateQuestion(question.id, body, HTTP_Status.BAD_REQUEST_400, 'correctAnswers');
    });
    it('update shouldn`t update question with bad id', async () => {
      const dto: UpdateQuestionDto = { body: 'Most popular drink?', correctAnswers: ['tea'] };
      await testQuizQuestions.updateQuestion('1', dto, HTTP_Status.BAD_REQUEST_400);
      await testQuizQuestions.updateQuestion(question4.id, dto, HTTP_Status.NOT_FOUND_404);
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/1`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('update should update question', async () => {
      const dto: UpdateQuestionDto = { body: 'Most popular drink?', correctAnswers: ['tea'] };
      await testQuizQuestions.updateQuestion(question.id, dto);

      const updatedQuestion = (await testQuizQuestions.findQuestions(`bodySearchTerm=${dto.body}`)).items[0];
      expect(updatedQuestion).toEqual({ ...question, ...dto, published: false, updatedAt: expect.any(String) });
      expect(question.updatedAt).not.toEqual(updatedQuestion.updatedAt);
      question = updatedQuestion;
    });
  });
});
