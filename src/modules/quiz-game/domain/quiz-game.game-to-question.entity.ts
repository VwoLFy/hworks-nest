import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuizGame } from './quiz-game.entity';
import { QuizQuestion } from '../../quiz-questions/domain/quiz-question.entity';

@Entity('QuizGamesToQuestions')
export class QuizQuestionToGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @Column('json')
  correctAnswers: string[];

  @Column('uuid')
  quizGameId: string;

  @Column('uuid')
  quizQuestionId: string;

  @ManyToOne(() => QuizGame, (g) => g.questions)
  quizGame: QuizGame;

  @ManyToOne(() => QuizQuestion)
  quizQuestion: QuizQuestion;

  constructor(quizGameId: string, { ...question }: QuizQuestion) {
    this.quizGameId = quizGameId;
    this.quizQuestionId = question.id;
    this.body = question.body;
    this.correctAnswers = question.correctAnswers;
  }
}
