import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { INestApplication } from '@nestjs/common';
import { GamePairViewModel } from '../../src/modules/pair-quiz-game/api/models/GamePairViewModel';
import { AnswerViewModel } from '../../src/modules/pair-quiz-game/api/models/AnswerViewModel';

export class TestQuizGame {
  constructor(private app: INestApplication) {}

  async createGame(accessToken: string): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HTTP_Status.OK_200);

    return result.body;
  }

  async answerQuestion(accessToken: string, answer: string): Promise<AnswerViewModel> {
    const result = await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .auth(accessToken, { type: 'bearer' })
      .send({ answer: answer })
      .expect(HTTP_Status.OK_200);

    return result.body;
  }

  async findGameById(accessToken: string, gameId: string): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HTTP_Status.OK_200);

    return result.body;
  }

  async findUsersCurrentGame(accessToken: string): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HTTP_Status.OK_200);

    return result.body;
  }
}
