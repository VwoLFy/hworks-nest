import { Module } from '@nestjs/common';
import { QuizQuestionsController } from './api/quiz-questions.controller';
import { QuizQuestionsRepository } from './infrastructure/quiz-questions.repository';
import { QuizQuestionsQueryRepo } from './infrastructure/quiz-questions.queryRepo';
import { CreateQuestionUseCase } from './application/use-cases/create-question-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from './domain/quiz-question.entity';
import { DeleteQuestionUseCase } from './application/use-cases/delete-question-use-case';

const useCases = [CreateQuestionUseCase, DeleteQuestionUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion]), CqrsModule],
  controllers: [QuizQuestionsController],
  providers: [QuizQuestionsRepository, QuizQuestionsQueryRepo, ...useCases],
})
export class SaQuizModule {}
