import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerStatuses } from '../application/enums';
import { Player } from './quiz-game.player.entity';

@Entity('QuizGamePlayerAnswers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  questionId: string;
  @Column()
  answerStatus: AnswerStatuses;
  @Column()
  addedAt: Date;
  @ManyToOne(() => Player, (p) => p.answers)
  player: Player;

  constructor(questionId: string, isAnswerCorrect: boolean) {
    this.questionId = questionId;
    this.answerStatus = isAnswerCorrect ? AnswerStatuses.Correct : AnswerStatuses.Incorrect;
    this.addedAt = new Date();
  }
}
