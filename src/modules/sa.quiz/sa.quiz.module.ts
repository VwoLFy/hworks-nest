import { Module } from '@nestjs/common';
import { QuizController } from './api/quiz.controller';
import { QuizRepository } from './infrastructure/quiz.repository';
import { QuizQueryRepo } from './infrastructure/quiz.queryRepo';
import { CreateQuestionUseCase } from './application/use-cases/create-question-use-case';
import { CqrsModule } from '@nestjs/cqrs';

const useCases = [CreateQuestionUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [QuizController],
  providers: [QuizRepository, QuizQueryRepo, ...useCases],
})
export class SaQuizModule {}
