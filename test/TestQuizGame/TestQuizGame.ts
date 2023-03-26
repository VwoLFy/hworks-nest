import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { INestApplication } from '@nestjs/common';
import { GamePairViewModel } from '../../src/modules/quiz-game/api/models/GamePairViewModel';
import { AnswerViewModel } from '../../src/modules/quiz-game/api/models/AnswerViewModel';
import { PageViewModel } from '../../src/main/types/PageViewModel';

export class TestQuizGame {
  constructor(private app: INestApplication) {}

  async createGame(accessToken: string, httpStatus: HTTP_Status = HTTP_Status.OK_200): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(accessToken, { type: 'bearer' })
      .expect(httpStatus);

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

  async findGameById(
    accessToken: string,
    gameId: string,
    httpStatus: HTTP_Status = HTTP_Status.OK_200,
  ): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(httpStatus);

    return result.body;
  }

  async findUsersCurrentGame(accessToken: string): Promise<GamePairViewModel> {
    const result = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HTTP_Status.OK_200);

    return result.body;
  }

  async findUserGames(
    accessToken: string,
    query: string,
    httpStatus: HTTP_Status = HTTP_Status.OK_200,
  ): Promise<PageViewModel<GamePairViewModel>> {
    const result = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my?${query}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(httpStatus);

    return result.body;
  }
}

// const a1 =
//   {"id":"0aa9876e-5edf-4323-b18e-8075fe0dca7b","firstPlayerProgress":{"answers":[{"addedAt":"2023-03-26T13:54:59.574Z","answerStatus":"Correct","questionId":"3d095410-589a-430c-943b-b26fa71b6b85"},{"addedAt":"2023-03-26T13:55:00.810Z","answerStatus":"Incorrect","questionId":"8ef31fef-a662-4363-964c-bf4b7b1fb111"},{"addedAt":"2023-03-26T13:55:08.580Z","answerStatus":"Correct","questionId":"b2a4e79b-575e-46b5-8fb2-091858960cee"},{"addedAt":"2023-03-26T13:55:09.916Z","answerStatus":"Correct","questionId":"6756ed12-8231-490f-afca-f52c7b3e2ebd"},{"addedAt":"2023-03-26T13:55:11.260Z","answerStatus":"Incorrect","questionId":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0"}],"player":{"id":"27ecf5dc-bfec-4567-9bbf-331bc2c746ee","login":"6932lg"},"score":3},"secondPlayerProgress":{"answers":[{"addedAt":"2023-03-26T13:55:02.064Z","answerStatus":"Correct","questionId":"3d095410-589a-430c-943b-b26fa71b6b85"},{"addedAt":"2023-03-26T13:55:03.437Z","answerStatus":"Incorrect","questionId":"8ef31fef-a662-4363-964c-bf4b7b1fb111"},{"addedAt":"2023-03-26T13:55:04.692Z","answerStatus":"Incorrect","questionId":"b2a4e79b-575e-46b5-8fb2-091858960cee"},{"addedAt":"2023-03-26T13:55:05.926Z","answerStatus":"Incorrect","questionId":"6756ed12-8231-490f-afca-f52c7b3e2ebd"},{"addedAt":"2023-03-26T13:55:07.212Z","answerStatus":"Incorrect","questionId":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0"}],"player":{"id":"1560b185-5349-45ec-946d-d1db6e1d428b","login":"6931lg"},"score":2},"questions":[{"id":"3d095410-589a-430c-943b-b26fa71b6b85","body":"question body0 849965"},{"id":"8ef31fef-a662-4363-964c-bf4b7b1fb111","body":"question body4 855744"},{"id":"b2a4e79b-575e-46b5-8fb2-091858960cee","body":"question body2 853184"},{"id":"6756ed12-8231-490f-afca-f52c7b3e2ebd","body":"question body3 854540"},{"id":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0","body":"question body1 851170"}],"status":"Finished","pairCreatedDate":"2023-03-26T13:54:56.706Z","startGameDate":"2023-03-26T13:54:58.136Z","finishGameDate":Any<String(ISODate)>}
// const a2 =
//   {"id":"0aa9876e-5edf-4323-b18e-8075fe0dca7b","firstPlayerProgress":{"answers":[{"questionId":"3d095410-589a-430c-943b-b26fa71b6b85","answerStatus":"Correct","addedAt":"2023-03-26T13:54:59.574Z"},{"questionId":"8ef31fef-a662-4363-964c-bf4b7b1fb111","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:00.810Z"},{"questionId":"b2a4e79b-575e-46b5-8fb2-091858960cee","answerStatus":"Correct","addedAt":"2023-03-26T13:55:08.580Z"},{"questionId":"6756ed12-8231-490f-afca-f52c7b3e2ebd","answerStatus":"Correct","addedAt":"2023-03-26T13:55:09.916Z"},{"questionId":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:11.260Z"}],"player":{"id":"27ecf5dc-bfec-4567-9bbf-331bc2c746ee","login":"6932lg"},"score":3},"secondPlayerProgress":{"answers":[{"questionId":"3d095410-589a-430c-943b-b26fa71b6b85","answerStatus":"Correct","addedAt":"2023-03-26T13:55:02.064Z"},{"questionId":"8ef31fef-a662-4363-964c-bf4b7b1fb111","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:03.437Z"},{"questionId":"b2a4e79b-575e-46b5-8fb2-091858960cee","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:04.692Z"},{"questionId":"6756ed12-8231-490f-afca-f52c7b3e2ebd","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:05.926Z"},{"questionId":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0","answerStatus":"Incorrect","addedAt":"2023-03-26T13:55:07.212Z"}],"player":{"id":"1560b185-5349-45ec-946d-d1db6e1d428b","login":"6931lg"},"score":2},"questions":[{"id":"8ef31fef-a662-4363-964c-bf4b7b1fb111","body":"question body4 855744"},{"id":"b2a4e79b-575e-46b5-8fb2-091858960cee","body":"question body2 853184"},{"id":"6756ed12-8231-490f-afca-f52c7b3e2ebd","body":"question body3 854540"},{"id":"3d095410-589a-430c-943b-b26fa71b6b85","body":"question body0 849965"},{"id":"2af2f65a-6c1e-44e3-a0e8-c5aafd63eca0","body":"question body1 851170"}],"status":"Finished","pairCreatedDate":"2023-03-26T13:54:56.706Z","startGameDate":"2023-03-26T13:54:58.136Z","finishGameDate":"2023-03-26T13:55:11.260Z"}
// JSON.stringify(a1) === JSON.stringify(a2)
