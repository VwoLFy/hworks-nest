import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { PublishQuestionDto } from '../application/dto/PublishQuestionDto';
import { PublishQuestionCommand } from '../application/use-cases/publish-question-use-case';
import { UpdateQuestionDto } from '../application/dto/UpdateQuestionDto';
import { UpdateQuestionCommand } from '../application/use-cases/update-question-use-case';

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

  @Put(':questionId')
  @HttpCode(HTTP_Status.NO_CONTENT_204)
  async updateQuestion(@Param('questionId', ParseUUIDPipe) questionId: string, @Body() dto: UpdateQuestionDto) {
    await this.commandBus.execute(new UpdateQuestionCommand(questionId, dto));
  }

  @Put(':questionId/publish')
  @HttpCode(HTTP_Status.NO_CONTENT_204)
  async publishQuestion(@Param('questionId', ParseUUIDPipe) questionId: string, @Body() dto: PublishQuestionDto) {
    await this.commandBus.execute(new PublishQuestionCommand(questionId, dto));
  }

  @Delete(':questionId')
  @HttpCode(HTTP_Status.NO_CONTENT_204)
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    await this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }
}
