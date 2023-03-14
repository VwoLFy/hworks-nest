import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { QuizQuestionsQueryRepo } from '../infrastructure/quiz-questions.queryRepo';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { findQuestionsQueryPipe } from './models/FindQuestionsQueryPipe';
import { FindQuestionsQueryModel } from './models/FindQuestionsQueryModel';
import { QuestionViewModel } from './models/QuestionViewModel';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/create-question-use-case';
import { CreateQuestionDto } from '../application/dto/CreateQuestionDto';
import { HTTP_Status } from '../../../main/types/enums';
import { DeleteQuestionCommand } from '../application/use-cases/delete-question-use-case';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class QuizQuestionsController {
  constructor(private quizQuestionsQueryRepo: QuizQuestionsQueryRepo, private commandBus: CommandBus) {}

  @Get('')
  async findQuestions(
    @Query(findQuestionsQueryPipe) query: FindQuestionsQueryModel,
  ): Promise<PageViewModel<QuestionViewModel>> {
    return this.quizQuestionsQueryRepo.findQuestions(query);
  }

  @Post('')
  async createQuestion(@Body() dto: CreateQuestionDto): Promise<QuestionViewModel> {
    const createdQuestionId = await this.commandBus.execute(new CreateQuestionCommand(dto));
    return await this.quizQuestionsQueryRepo.findQuestion(createdQuestionId);
  }

  @Delete(':questionId')
  @HttpCode(HTTP_Status.NO_CONTENT_204)
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    await this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }
}
