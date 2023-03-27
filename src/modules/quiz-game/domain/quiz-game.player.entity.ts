import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { QuizGame } from './quiz-game.entity';
import { Answer } from './quiz-game.answer.entity';
import { GameResult } from '../application/enums';

@Entity('QuizGamePlayers')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: string;
  @Column()
  login: string;
  @OneToMany(() => Answer, (a) => a.player, { cascade: true, eager: true })
  answers: Answer[];
  @Column()
  score: number;
  @Column()
  isCompletedAnswering: boolean;
  @ManyToOne(() => User)
  user: User;
  @Column()
  quizGameId: string;
  @ManyToOne(() => QuizGame, (q) => q.players, { orphanedRowAction: 'disable' })
  quizGame: QuizGame;
  @Column()
  numberOfQuestions: number;
  @Column({ nullable: true })
  gameResult: GameResult;

  constructor(quizGameId: string, userId: string, userLogin: string, numberOfQuestions: number) {
    this.userId = userId;
    this.login = userLogin;
    this.answers = null;
    this.score = 0;
    this.quizGameId = quizGameId;
    this.isCompletedAnswering = false;
    this.numberOfQuestions = numberOfQuestions;
    this.gameResult = null;
  }

  public countOfAnswers(): number {
    return this.answers.length;
  }

  public processAnswer(questionId: string, isAnswerCorrect: boolean): Answer {
    const answer = new Answer(questionId, isAnswerCorrect);
    this.answers.push(answer);

    if (isAnswerCorrect) ++this.score;
    if (this.answers.length === this.numberOfQuestions) this.isCompletedAnswering = true;
    return answer;
  }

  public addBonusScore() {
    this.score++;
  }

  public setGameResult(gameResult: GameResult) {
    this.gameResult = gameResult;
  }
}
