import { PageViewModel } from '../../src/main/types/PageViewModel';
import { QuestionViewModel } from '../../src/modules/sa.quiz/api/models/QuestionViewModel';
import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { CreateQuestionDto } from '../../src/modules/sa.quiz/application/dto/CreateQuestionDto';
import { PublishQuestionDto } from '../../src/modules/sa.quiz/application/dto/PublishQuestionDto';
import { UpdateQuestionDto } from '../../src/modules/sa.quiz/application/dto/UpdateQuestionDto';
import { INestApplication } from '@nestjs/common';
import { BadRequestError, testCheckBadRequestError } from '../Utils/TestCheckBadRequestError';

export class TestQuizQuestions {
  constructor(private app: INestApplication) {}

  async findQuestions(query: string = ''): Promise<PageViewModel<QuestionViewModel>> {
    const result = await request(this.app.getHttpServer())
      .get(`/sa/quiz/questions?${query}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_Status.OK_200);
    return result.body;
  }

  async createQuestion(body: CreateQuestionDto): Promise<QuestionViewModel> {
    const result = await request(this.app.getHttpServer())
      .post(`/sa/quiz/questions`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(body)
      .expect(HTTP_Status.CREATED_201);

    return result.body;
  }

  async publishQuestion(questionId: string, dto: PublishQuestionDto) {
    await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HTTP_Status.NO_CONTENT_204);
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HTTP_Status.NO_CONTENT_204);
  }

  async publishQuestion400(questionId: string, dto: PublishQuestionDto) {
    const result = await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HTTP_Status.BAD_REQUEST_400);

    const error: BadRequestError = result.body;
    testCheckBadRequestError(error, 'published');
    return error;
  }

  async deleteQuestion(questionId: string) {
    await request(this.app.getHttpServer())
      .delete(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_Status.NO_CONTENT_204);
  }

  async createQuestion400(dto: CreateQuestionDto, field: string): Promise<BadRequestError> {
    const result = await request(this.app.getHttpServer())
      .post(`/sa/quiz/questions`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HTTP_Status.BAD_REQUEST_400);

    const error: BadRequestError = result.body;
    testCheckBadRequestError(error, field);
    return error;
  }

  async updateQuestion400(questionId: string, dto: UpdateQuestionDto, field: string): Promise<BadRequestError> {
    const result = await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HTTP_Status.BAD_REQUEST_400);

    const error: BadRequestError = result.body;
    testCheckBadRequestError(error, field);
    return error;
  }
}
