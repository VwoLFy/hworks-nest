import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { QuizGame } from './quiz-game.entity';
import { Answer } from './quiz-game.answer.entity';

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

  constructor(quizGameId: string, userId: string, userLogin: string) {
    this.userId = userId;
    this.login = userLogin;
    this.answers = null;
    this.score = 0;
    this.quizGameId = quizGameId;
    this.isCompletedAnswering = false;
  }

  public countOfAnswers(): number {
    return this.answers.length;
  }

  public processAnswer(questionId: string, isAnswerCorrect: boolean): Answer {
    const answer = new Answer(questionId, isAnswerCorrect);
    this.answers.push(answer);
    if (isAnswerCorrect) ++this.score;
    if (this.answers.length === 5) this.isCompletedAnswering = true;
    return answer;
  }

  public addBonusScore() {
    this.score++;
  }
}
