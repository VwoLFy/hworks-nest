import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { QuizQuestion } from '../../sa.quiz/domain/quiz-question.entity';
import { GameStatuses } from '../application/enums';
import { randomUUID } from 'crypto';
import { Player } from './quiz-game.player.entity';
import { Answer } from './quiz-game.answer.entity';

@Entity('QuizGames')
export class QuizGame {
  @PrimaryColumn('uuid')
  id: string;
  @OneToMany(() => Player, (p) => p.quizGame, { cascade: true, eager: true })
  players: Player[];
  @ManyToMany(() => QuizQuestion, { eager: true })
  @JoinTable()
  questions: QuizQuestion[];
  @Column()
  status: GameStatuses;
  @Column()
  pairCreatedDate: Date;
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;
  @Column()
  numberOfPlayers: number;
  @Column()
  numberOfQuestionsForPlayer: number;
  @Column()
  totalAnswers: number;

  constructor() {
    this.id = randomUUID();
    this.players = null;
    this.questions = null;
    this.status = GameStatuses.PendingSecondPlayer;
    this.pairCreatedDate = new Date();
    this.startGameDate = null;
    this.finishGameDate = null;
    this.numberOfPlayers = 2;
    this.numberOfQuestionsForPlayer = 5;
    this.totalAnswers = 0;
  }

  static addPlayerToPendingOrNewGame(game: QuizGame | null, userId: string, userLogin: string): QuizGame {
    if (!game) {
      game = new QuizGame();
      game.createPlayer(userId, userLogin);
    } else {
      game.addPlayer(userId, userLogin);
    }
    return game;
  }

  public createPlayer(userId: string, userLogin: string) {
    const player = new Player(this.id, userId, userLogin, this.numberOfQuestionsForPlayer);
    if (!this.players || this.players.length === 0) this.players = [];
    this.players.push(player);
  }

  public addPlayer(userId: string, userLogin: string) {
    const addedPlayer = new Player(this.id, userId, userLogin, this.numberOfQuestionsForPlayer);
    this.players.push(addedPlayer);

    if (this.players.length !== this.numberOfPlayers) return;
    this.status = GameStatuses.Active;
    this.startGameDate = new Date();
  }

  public addQuestions(questions: QuizQuestion[]) {
    this.questions = questions;
  }

  private areAllQuestionsAnswered(indexOfPlayer: number): boolean {
    return this.players[indexOfPlayer].isCompletedAnswering;
  }

  public processAnswer(userId: string, receivedAnswer: string): Answer | null {
    const indexOfPlayer = this.players.findIndex((pl) => pl.userId === userId);

    if (this.areAllQuestionsAnswered(indexOfPlayer)) return null;

    this.totalAnswers++;
    const countOfAnswers = this.players[indexOfPlayer].countOfAnswers();
    const questionWithAnswer = this.questions[countOfAnswers];
    const isAnswerCorrect = questionWithAnswer.correctAnswers.includes(receivedAnswer);

    const answer = this.players[indexOfPlayer].processAnswer(questionWithAnswer.id, isAnswerCorrect);
    this.checkGameOver();

    return answer;
  }

  private finishGame() {
    this.status = GameStatuses.Finished;
    this.finishGameDate = new Date();
    this.addBonusScore();
  }

  private checkGameOver() {
    if (this.totalAnswers === this.numberOfPlayers * this.numberOfQuestionsForPlayer) this.finishGame();
  }

  private addBonusScore() {
    const fastestPlayer = this.players
      .map((pl) => pl.answers[pl.answers.length - 1].addedAt)
      .reduce((a, b, i, arr) => (arr[a] < b ? a : i), 0);
    if (this.players[fastestPlayer].score > 0) this.players[fastestPlayer].addBonusScore();
  }
}
