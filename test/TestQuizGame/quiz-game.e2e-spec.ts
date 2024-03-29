import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HTTP_Status } from '../../src/main/types/enums';
import { TestQuizGame } from './TestQuizGame';
import { UserViewModel } from '../../src/modules/users/api/models/UserViewModel';
import { GamePairViewModel } from '../../src/modules/quiz-game/api/models/GamePairViewModel';
import { AnswerStatuses, GameStatuses } from '../../src/modules/quiz-game/application/enums';
import { TestQuizQuestions } from '../TestQuizQuestions/TestQuizQuestions';
import { AnswerViewModel } from '../../src/modules/quiz-game/api/models/AnswerViewModel';
import { TestUsers } from '../TestUsers/TestUsers';
import { testCreateApp } from '../Utils/TestCreateApp';

describe('quiz game (e2e)', () => {
  let app: INestApplication;
  let testQuizGame: TestQuizGame;
  let testQuizQuestions: TestQuizQuestions;
  let testUsers: TestUsers;

  beforeAll(async () => {
    app = await testCreateApp();

    testUsers = new TestUsers(app);
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
    let game3: GamePairViewModel;
    let game4: GamePairViewModel;
    let game5: GamePairViewModel;
    let answer: AnswerViewModel;
    let answer2: AnswerViewModel;
    enum ChitAnswer {
      Correct = 'Correct',
      Incorrect = 'Incorrect',
    }
    it('create user with tokens', async () => {
      const usersWithTokens = await testUsers.createUsersWithTokens(5);
      users = usersWithTokens.users;
      accessTokens = usersWithTokens.accessTokens;
    });
    it('create 10 questions and publish they', async () => {
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

      for (const question of pageQuestions.items) {
        await testQuizQuestions.publishQuestion(question.id, { published: true });
      }
    });
    it('create game', async () => {
      game = await testQuizGame.connectToTheGame(accessTokens[0]);

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
      await testQuizGame.connectToTheGame(accessTokens[0], HTTP_Status.FORBIDDEN_403);
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
      await testQuizGame.findGameById(accessTokens[0], '1', HTTP_Status.BAD_REQUEST_400);
    });
    it('find game by id shouldn`t return game if game is not exist', async () => {
      await testQuizGame.findGameById(accessTokens[0], users[0].id, HTTP_Status.NOT_FOUND_404);
    });
    it('find game by id shouldn`t return game if user is not participant of this game', async () => {
      await testQuizGame.findGameById(accessTokens[1], game.id, HTTP_Status.FORBIDDEN_403);
    });
    it('find users current game by id should return game', async () => {
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[0]);
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

      game = await testQuizGame.connectToTheGame(accessTokens[1]);
      expect(game).toEqual(expectedResult);
    });
    it('shouldn`t create game if user is already playing', async () => {
      await testQuizGame.connectToTheGame(accessTokens[0], HTTP_Status.FORBIDDEN_403);
    });
    it('find users current game by id should return active game', async () => {
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[0]);
      expect(result).toEqual(game);
    });
    it('find game by id should return active game', async () => {
      const result = await testQuizGame.findGameById(accessTokens[0], game.id);
      expect(result).toEqual(game);
    });
    it('create game2 by user3', async () => {
      const result = await testQuizGame.connectToTheGame(accessTokens[2]);

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
    it('add user4 to existing game2', async () => {
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

      const result = await testQuizGame.connectToTheGame(accessTokens[3]);
      expect(result).toEqual(expectedResult);
    });
    it('find game by id should return game2', async () => {
      const result = await testQuizGame.findGameById(accessTokens[1], game.id);
      expect(result).toEqual(game);
    });
    it('find users current game by id should return game2', async () => {
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[1]);
      expect(result).toEqual(game);
    });
    it('answer should return 401 if user is not authorized', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.UNAUTHORIZED_401);
    });
    it('correct answer question in game1', async () => {
      answer = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      expect(answer).toEqual({
        questionId: expect.any(String),
        answerStatus: AnswerStatuses.Correct,
        addedAt: expect.any(String),
      });
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[1]);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: { ...game.firstPlayerProgress, answers: [answer], score: 1 },
      });
    });
    it('incorrect answer question in game1', async () => {
      answer2 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      expect(answer2).toEqual({
        questionId: expect.any(String),
        answerStatus: AnswerStatuses.Incorrect,
        addedAt: expect.any(String),
      });
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[1]);
      expect(result).toEqual({
        ...game,
        firstPlayerProgress: { ...game.firstPlayerProgress, answers: [answer, answer2], score: 1 },
      });
      expect(answer).not.toEqual(answer2);
    });
    it('answer +3 questions in game1', async () => {
      const answer3 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      const answer4 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      const answer5 = await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      const result = await testQuizGame.findUsersCurrentGame(accessTokens[0]);
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
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('answer should return 403 if user is not in game', async () => {
      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(accessTokens[4], { type: 'bearer' })
        .send({ answer: ChitAnswer.Correct })
        .expect(HTTP_Status.FORBIDDEN_403);
    });
    it('answer +5 questions by second player and check status of the game1 after finish', async () => {
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
    it('get statistic after game1', async () => {
      const statistic = await testQuizGame.getUserStatistic(accessTokens[0]);
      expect(statistic).toEqual({
        gamesCount: 1,
        winsCount: 0,
        lossesCount: 0,
        drawsCount: 1,
        sumScore: 4,
        avgScores: 4,
      });
    });
    it('answer 3 questions by first player in game2', async () => {
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
    });
    it('answer 5 questions by second player and +2 questions by first player and check status of the game2', async () => {
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);

      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      const game = await testQuizGame.findUsersCurrentGame(accessTokens[2]);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Incorrect);
      const game2 = await testQuizGame.findGameById(accessTokens[2], game.id);
      expect(game.secondPlayerProgress.score).toBe(game2.secondPlayerProgress.score);
      expect(game2.secondPlayerProgress.score).toBe(0);
      expect(game2.firstPlayerProgress.score).toBe(4);
      expect(game2.status).toBe(GameStatuses.Finished);
    });
    it('get statistic after game2', async () => {
      const statistic = await testQuizGame.getUserStatistic(accessTokens[2]);
      expect(statistic).toEqual({
        gamesCount: 1,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 0,
        sumScore: 4,
        avgScores: 4,
      });

      const statistic2 = await testQuizGame.getUserStatistic(accessTokens[3]);
      expect(statistic2).toEqual({
        gamesCount: 1,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 0,
        sumScore: 0,
        avgScores: 0,
      });
    });
    it('create new game3 by user4', async () => {
      game3 = await testQuizGame.connectToTheGame(accessTokens[3]);

      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: {
          player: {
            id: users[3].id,
            login: users[3].login,
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
      expect(game3).toEqual(expectedResult);
    });
    it('add user 1 to existing game3', async () => {
      const expectedResult: GamePairViewModel = {
        id: expect.any(String),
        firstPlayerProgress: {
          player: {
            id: users[3].id,
            login: users[3].login,
          },
          answers: [],
          score: 0,
        },
        secondPlayerProgress: {
          player: {
            id: users[0].id,
            login: users[0].login,
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

      game3 = await testQuizGame.connectToTheGame(accessTokens[0]);
      expect(game3).toEqual(expectedResult);
    });
    it('create new game3x by user2 and playing with user3', async () => {
      let game3x = await testQuizGame.connectToTheGame(accessTokens[1]);
      await testQuizGame.connectToTheGame(accessTokens[2]);
      await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[1], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[2], ChitAnswer.Correct);

      game3x = await testQuizGame.findGameById(accessTokens[1], game3x.id);
      expect(game3x.firstPlayerProgress.score).toBe(6);
      expect(game3x.secondPlayerProgress.score).toBe(5);
      expect(game3x.status).toBe(GameStatuses.Finished);
    });
    it('playing game3', async () => {
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);

      game3 = await testQuizGame.findGameById(accessTokens[3], game3.id);
      expect(game3.firstPlayerProgress.score).toBe(5);
      expect(game3.secondPlayerProgress.score).toBe(3);
      expect(game3.status).toBe(GameStatuses.Finished);
    });
    it('get statistic after game3', async () => {
      const statistic = await testQuizGame.getUserStatistic(accessTokens[0]);
      expect(statistic).toEqual({
        gamesCount: 2,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 1,
        sumScore: 7,
        avgScores: 3.5,
      });

      const statistic2 = await testQuizGame.getUserStatistic(accessTokens[3]);
      expect(statistic2).toEqual({
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 1,
        drawsCount: 0,
        sumScore: 5,
        avgScores: 2.5,
      });
    });
    it('create new game4 by user1 and playing with user4', async () => {
      game4 = await testQuizGame.connectToTheGame(accessTokens[0]);
      await testQuizGame.connectToTheGame(accessTokens[3]);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Incorrect);

      game4 = await testQuizGame.findGameById(accessTokens[0], game4.id);
      expect(game4.firstPlayerProgress.score).toBe(0);
      expect(game4.secondPlayerProgress.score).toBe(3);
      expect(game4.status).toBe(GameStatuses.Finished);
    });
    it('get statistic after game4', async () => {
      const statistic = await testQuizGame.getUserStatistic(accessTokens[0]);
      expect(statistic).toEqual({
        gamesCount: 3,
        winsCount: 0,
        lossesCount: 2,
        drawsCount: 1,
        sumScore: 7,
        avgScores: 2.33,
      });

      const statistic2 = await testQuizGame.getUserStatistic(accessTokens[3]);
      expect(statistic2).toEqual({
        gamesCount: 3,
        winsCount: 2,
        lossesCount: 1,
        drawsCount: 0,
        sumScore: 8,
        avgScores: 2.67,
      });
    });
    it('create new game5 by user1 and playing with user4', async () => {
      game5 = await testQuizGame.connectToTheGame(accessTokens[0]);
      await testQuizGame.connectToTheGame(accessTokens[3]);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[3], ChitAnswer.Correct);
      await testQuizGame.answerQuestion(accessTokens[0], ChitAnswer.Incorrect);

      game5 = await testQuizGame.findGameById(accessTokens[0], game5.id);
      expect(game5.firstPlayerProgress.score).toBe(1);
      expect(game5.secondPlayerProgress.score).toBe(1);
      expect(game5.status).toBe(GameStatuses.Active);
    });
    it('should return users games 1 and 3 with query', async () => {
      let query = `sortDirection=desc`;
      let pageGames = await testQuizGame.findUserGames(accessTokens[0], query);
      expect(pageGames).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [game5, game4, game3, game],
      });

      query = `sortDirection=asc`;
      pageGames = await testQuizGame.findUserGames(accessTokens[0], query);
      expect(pageGames).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [game, game3, game4, game5],
      });

      query = `sortBy=status`;
      pageGames = await testQuizGame.findUserGames(accessTokens[0], query);
      expect(pageGames).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [game4, game3, game, game5],
      });

      query = `pageSize=1`;
      pageGames = await testQuizGame.findUserGames(accessTokens[0], query);
      expect(pageGames).toEqual({
        pagesCount: 4,
        page: 1,
        pageSize: 1,
        totalCount: 4,
        items: [game5],
      });

      query = `pageSize=2&pageNumber=2`;
      pageGames = await testQuizGame.findUserGames(accessTokens[0], query);
      expect(pageGames).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
        totalCount: 4,
        items: [game3, game],
      });
    });
  });
});
