import { Injectable } from '@nestjs/common';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQuestionsRepository {
  constructor(@InjectRepository(QuizQuestion) private readonly questionsRepositoryT: Repository<QuizQuestion>) {}

  async save(question: QuizQuestion) {
    await this.questionsRepositoryT.save(question);
  }

  async findQuestion(questionId: string): Promise<QuizQuestion> {
    return this.questionsRepositoryT.findOne({ where: { id: questionId } });
  }

  async deleteQuestion(questionId: string) {
    await this.questionsRepositoryT.delete({ id: questionId });
  }

  async findNQuestions(numberOfQuestions: number): Promise<QuizQuestion[]> {
    return this.questionsRepositoryT
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .where('published = true')
      .limit(numberOfQuestions)
      .getMany();
  }
}
