import { PageViewModel } from '../../src/main/types/PageViewModel';
import { QuestionViewModel } from '../../src/modules/quiz-questions/api/models/QuestionViewModel';
import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { CreateQuestionDto } from '../../src/modules/quiz-questions/application/dto/CreateQuestionDto';
import { PublishQuestionDto } from '../../src/modules/quiz-questions/application/dto/PublishQuestionDto';
import { UpdateQuestionDto } from '../../src/modules/quiz-questions/application/dto/UpdateQuestionDto';
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

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    httpStatus: HTTP_Status = HTTP_Status.CREATED_201,
    field?: string,
  ): Promise<QuestionViewModel> {
    const result = await request(this.app.getHttpServer())
      .post(`/sa/quiz/questions`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(createQuestionDto)
      .expect(httpStatus);

    if (httpStatus !== HTTP_Status.BAD_REQUEST_400) return result.body;

    const error: BadRequestError = result.body;
    testCheckBadRequestError(error, field);
    return null;
  }

  async publishQuestion(
    questionId: string,
    publishQuestionDto: PublishQuestionDto,
    httpStatus: HTTP_Status = HTTP_Status.NO_CONTENT_204,
    field?: string,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(publishQuestionDto)
      .expect(httpStatus);

    if (httpStatus === HTTP_Status.BAD_REQUEST_400 && field) {
      const error: BadRequestError = result.body;
      testCheckBadRequestError(error, field);
    }
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    httpStatus: HTTP_Status = HTTP_Status.NO_CONTENT_204,
    field?: string,
  ) {
    const result = await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(updateQuestionDto)
      .expect(httpStatus);

    if (httpStatus === HTTP_Status.BAD_REQUEST_400 && field) {
      const error: BadRequestError = result.body;
      testCheckBadRequestError(error, field);
    }
  }

  async deleteQuestion(questionId: string) {
    await request(this.app.getHttpServer())
      .delete(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_Status.NO_CONTENT_204);
  }
}
