import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HTTP_Status } from '../../src/main/types/enums';
import { EmailAdapter } from '../../src/modules/auth/infrastructure/email.adapter';
import { appConfig } from '../../src/app.config';
import { TestQuizGame } from './TestQuizGame';
import { UserViewModel } from '../../src/modules/sa.users/api/models/UserViewModel';
import { GamePairViewModel } from '../../src/modules/pair-quiz-game/api/models/GamePairViewModel';
import { AnswerStatuses, GameStatuses } from '../../src/modules/pair-quiz-game/application/enums';
import { TestQuizQuestions } from '../TestQuizQuestions/TestQuizQuestions';
import { AnswerViewModel } from '../../src/modules/pair-quiz-game/api/models/AnswerViewModel';

let app: INestApplication;

async function createUsersWithTokens(countUsers: number): Promise<{ users: UserViewModel[]; accessTokens: string[] }> {
  const users: UserViewModel[] = [];
  const accessTokens: string[] = [];

  for (let i = 1; i <= countUsers; i++) {
    const createUserBody = {
      login: `login${i}`,
      password: `password`,
      email: `string${i}@sdf.ee`,
    };

    const resultUser = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(createUserBody)
      .expect(HTTP_Status.CREATED_201);
    users.push(resultUser.body);
    const resultToken = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: createUserBody.login, password: createUserBody.password })
      .expect(HTTP_Status.OK_200);
    accessTokens.push(resultToken.body.accessToken);
  }

  return { users: users, accessTokens: accessTokens };
}

describe('quiz game (e2e)', () => {
  let testQuizGame: TestQuizGame;
  let testQuizQuestions: TestQuizQuestions;

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
    testQuizGame = new TestQuizGame(app);
    testQuizQuestions = new TestQuizQuestions(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('quiz game', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(HTTP_Status.NO_CONTENT_204);
    });
    let users: UserViewModel[];
    let accessTokens: string[];
    let game: GamePairViewModel;
    let answer: AnswerViewModel;
    let answer2: AnswerViewModel;
    enum ChitAnswer {
      Correct = 'Correct',
      Incorrect = 'Incorrect',
    }
    it('create user with tokens', async () => {
      const usersWithTokens = await createUsersWithTokens(5);
      users = usersWithTokens.users;
      accessTokens = usersWithTokens.accessTokens;
    });
    it('create 10 questions', async () => {
      await testQuizQuestions.createQuestion({
        body: 'Which drink is commonly associated with Czech?',
        correctAnswers: ['beer', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'What sport did David Beckham play?',
        correctAnswers: ['football', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'What’s longer, a nautical mile or a mile?',
        correctAnswers: ['nautical mile', 'nautical', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'How many minutes in hour?',
        correctAnswers: ['60', 'sixty', '6ty', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'The biggest mountain in Europe?',
        correctAnswers: ['Alps', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'Which animal is the fastest?',
        correctAnswers: ['cheetah', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'A country where they like sandwiches with raw minced meat?',
        correctAnswers: ['Germany', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'What animal was the first to orbit in space?',
        correctAnswers: ['dog', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'How many colors are in the rainbow?',
        correctAnswers: ['7', 'seven', ChitAnswer.Correct],
      });
      await testQuizQuestions.createQuestion({
        body: 'How many oceans are there on earth?',
        correctAnswers: ['5', 'five', ChitAnswer.Correct],
      });

      const pageQuestions = await testQuizQuestions.findQuestions();
      expect(pageQuestions.totalCount).toBe(10);
    });
    it('create game', async () => {
      game = await testQuizGame.createGame(accessTokens[0]);

      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: {
          player: {
            id: users[0].id,
            login: users[0].login,
          },
          answers: [],
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatuses.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      };
      expect(game).toEqual(expectedResult);
    });
    it('shouldn`t add player to existing game if user is already playing', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(accessTokens[0], { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('shouldn`t create game if user is not authorized', async () => {
      await request(app.getHttpServer()).post(`/pair-game-quiz/pairs/connection`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('find game by id should return game', async () => {
      const result = await testQuizGame.findGameById(accessTokens[0], game.id);
      expect(result).toEqual(game);
    });
    it('find game by id shouldn`t return game if user is not authorized', async () => {
      await request(app.getHttpServer()).get(`/pair-game-quiz/pairs/${game.id}`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('find game by id shouldn`t return game with bad id', async () => {
      await request(app.getHttpServer())
        .get(`/pair-game-quiz/pairs/1`)
        .auth(accessTokens[0], { type: 'bearer' })
        .expect(HTTP_Status.BAD_REQUEST_400);
    });
    it('find game by id shouldn`t return game if game is not exist', async () => {
      await request(app.getHttpServer())
        .get(`/pair-game-quiz/pairs/${users[0].id}`)
        .auth(accessTokens[0], { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('find game by id shouldn`t return game if user is not participant of this game', async () => {
      await request(app.getHttpServer())
        .get(`/pair-game-quiz/pairs/${game.id}`)
        .auth(accessTokens[1], { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('find users current game by id should return game', async () => {
      const result = await testQuizGame.findUserCurrentGame(accessTokens[0]);
      expect(result).toEqual(game);
    });
    it('find users current game by id shouldn`t return game if user is not authorized', async () => {
      await request(app.getHttpServer()).get(`/pair-game-quiz/pairs/my-current`).expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('find users current game by id shouldn`t return game if no active game', async () => {
      await request(app.getHttpServer())
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(accessTokens[1], { type: 'bearer' })
        .expect(HTTP_Status.NOT_FOUND_404);
    });
    it('add player to existing game', async () => {
      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: game.firstPlayerProgress,
        secondPlayerProgress: {
          player: {
            id: users[1].id,
            login: users[1].login,
          },
          answers: [],
          score: 0,
        },
        questions: expect.arrayContaining([{ id: expect.any(String), body: expect.any(String) }]),
        status: GameStatuses.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      };

      game = await testQuizGame.createGame(accessTokens[1]);
      expect(game).toEqual(expectedResult);
    });
    it('shouldn`t create game if user is already playing', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(accessTokens[0], { type: 'bearer' })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('find users current game by id should return active game', async () => {
      const result = await testQuizGame.findUserCurrentGame(accessTokens[0]);
      expect(result).toEqual(game);
    });
    it('find game by id should return active game', async () => {
      const result = await testQuizGame.findGameById(accessTokens[0], game.id);
      expect(result).toEqual(game);
    });
    it('create 2 game', async () => {
      const result = await testQuizGame.createGame(accessTokens[2]);

      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: {
          player: {
            id: users[2].id,
            login: users[2].login,
          },
          answers: [],
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatuses.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      };
      expect(result).toEqual(expectedResult);
    });
    it('add player to existing game 2', async () => {
      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: {
          player: {
            id: users[2].id,
            login: users[2].login,
          },
          answers: [],
          score: 0,
        },
        secondPlayerProgress: {
          player: {
            id: users[3].id,
            login: users[3].login,
          },
          answers: [],
          score: 0,
        },
        questions: expect.arrayContaining([{ id: expect.any(String), body: expect.any(String) }]),
        status: GameStatuses.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      };

      const result = await testQuizGame.createGame(accessTokens[3]);
      expect(result).toEqual(expectedResult);
    });
    it('find game by id should return game/2', async () => {
      const result = await testQuizGame.findGameById(accessTokens[1], game.id);
      expect(result).toEqual(game);
    });
    it('find users current game by id should return game/2', async () => {
      const result = await testQuizGame.findUserCurrentGame(accessTokens[1]);
      expect(result).toEqual(game);
    });
    it('answer should return 401 if user is not authorized', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answer`)
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('correct answer question', async () => {
      answer = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      expect(answer).toEqual({
        questionId: expect.any(String),
        answerStatus: AnswerStatuses.Correct,
        addedAt: expect.any(String),
      });
      const result = await testQuizGame.findUserCurrentGame(accessTokens[1]);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: { ...game.firstPlayerProgress, answers: [answer], score: 1 },
      });
    });
    it('incorrect answer question', async () => {
      answer2 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      expect(answer2).toEqual({
        questionId: expect.any(String),
        answerStatus: AnswerStatuses.Incorrect,
        addedAt: expect.any(String),
      });
      const result = await testQuizGame.findUserCurrentGame(accessTokens[1]);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: { ...game.firstPlayerProgress, answers: [answer, answer2], score: 1 },
      });
      expect(answer).not.toEqual(answer2);
    });
    it('answer +3 questions', async () => {
      const answer3 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      const answer4 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      const answer5 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      const result = await testQuizGame.findUserCurrentGame(accessTokens[0]);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: {
          ...game.firstPlayerProgress,
          answers: [answer, answer2, answer3, answer4, answer5],
          score: 3,
        },
      });
      game = result;
    });
    it('answer should return 403 if user has already answered to all questions', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answer`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('answer should return 403 if user is not in game', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answer`)
        .auth(accessTokens[4], { type: 'bearer' })
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('answer +5 questions by second player and check status of the game', async () => {
      const answer1 = await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      const answer2 = await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      const answer3 = await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      const answer4 = await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Incorrect);
      const answer5 = await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      const result = await testQuizGame.findGameById(accessTokens[1], game.id);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: {
          ...game.firstPlayerProgress,
          score: 4,
        },
        secondPlayerProgress: {
          ...game.secondPlayerProgress,
          answers: [answer1, answer2, answer3, answer4, answer5],
          score: 4,
        },
        status: GameStatuses.Finished,
        finishGameDate: expect.any(String),
      });
      game = result;
    });
    it('answer 3 questions by first player of second game', async () => {
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
    });
    it('answer 5 questions by second player of second game and check status of the game', async () => {
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
    });
    it('answer +2 questions by first player of second game and check status of the game', async () => {
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      const game = await testQuizGame.findUserCurrentGame(accessTokens[2]);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Incorrect);
      const game2 = await testQuizGame.findGameById(accessTokens[2], game.id);
      expect(game.secondPlayerProgress.score).toBe(game2.secondPlayerProgress.score);
      expect(game2.secondPlayerProgress.score).toBe(0);
      expect(game2.firstPlayerProgress.score).toBe(4);
    });
  });
});
