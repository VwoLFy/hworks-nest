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
  players: Player[]; //one-to-many
  @ManyToMany(() => QuizQuestion, { eager: true })
  @JoinTable()
  questions: QuizQuestion[]; //many-to-many
  @Column()
  status: GameStatuses;
  @Column()
  pairCreatedDate: Date;
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;

  constructor() {
    this.id = randomUUID();
    this.players = null;
    this.questions = null;
    this.status = GameStatuses.PendingSecondPlayer;
    this.pairCreatedDate = new Date();
    this.startGameDate = null;
    this.finishGameDate = null;
  }

  public createPlayer(userId: string, userLogin: string) {
    if (!this.players) this.players = [];
    const player = new Player(this.id, userId, userLogin);
    this.players.push(player);
  }

  public addPlayer(userId: string, userLogin: string) {
    const addedPlayer = new Player(this.id, userId, userLogin);
    this.status = GameStatuses.Active;
    this.startGameDate = new Date();
    this.players.push(addedPlayer);
  }

  public addQuestions(questions: QuizQuestion[]) {
    this.questions = questions;
  }

  public areAllQuestionsAnswered(indexOfPlayer: number): boolean {
    return this.players[indexOfPlayer].isCompletedAnswering;
  }

  public processAnswer(indexOfPlayer: number, answer: string): Answer {
    const countOfAnswers = this.players[indexOfPlayer].countOfAnswers();
    const questionWithAnswer = this.questions[countOfAnswers];
    const isAnswerCorrect = questionWithAnswer.correctAnswers.includes(answer);
    return this.players[indexOfPlayer].processAnswer(questionWithAnswer.id, isAnswerCorrect);
  }

  public finishGame() {
    this.status = GameStatuses.Finished;
    this.finishGameDate = new Date();
    const fastestPlayer = this.players
      .map((pl) => pl.answers[pl.answers.length - 1].addedAt)
      .reduce((a, b, i, arr) => (arr[a] < b ? a : i), 0);
    if (this.players[fastestPlayer].score > 0) this.players[fastestPlayer].addBonusScore();
  }
}
