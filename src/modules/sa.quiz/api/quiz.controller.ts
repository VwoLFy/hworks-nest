import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QuizQueryRepo } from '../infrastructure/quiz.queryRepo';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { findQuestionsQueryPipe } from './models/FindQuestionsQueryPipe';
import { FindQuestionsQueryModel } from './models/FindQuestionsQueryModel';
import { QuestionViewModel } from './models/QuestionViewModel';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/create-question-use-case';
import { CreateQuestionDto } from '../application/dto/CreateQuestionDto';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class QuizController {
  constructor(private quizQueryRepo: QuizQueryRepo, private commandBus: CommandBus) {}

  @Get('')
  async findQuestions(
    @Query(findQuestionsQueryPipe) query: FindQuestionsQueryModel,
  ): Promise<PageViewModel<QuestionViewModel>> {
    return this.quizQueryRepo.findQuestions(query);
  }

  @Post('')
  async createQuestion(@Body() dto: CreateQuestionDto): Promise<QuestionViewModel> {
    return this.commandBus.execute(new CreateQuestionCommand(dto));
  }
}
