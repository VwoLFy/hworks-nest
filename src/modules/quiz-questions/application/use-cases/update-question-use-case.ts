import { UpdateQuestionDto } from '../dto/UpdateQuestionDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdateQuestionCommand {
  constructor(public questionId: string, public dto: UpdateQuestionDto) {}
}
@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private quizQuestionsRepository: QuizQuestionsRepository) {}

  async execute(command: UpdateQuestionCommand) {
    const foundQuestion = await this.quizQuestionsRepository.findQuestion(command.questionId);
    if (!foundQuestion) throw new NotFoundException('question not found');

    foundQuestion.update(command.dto);
    await this.quizQuestionsRepository.save(foundQuestion);
  }
}
