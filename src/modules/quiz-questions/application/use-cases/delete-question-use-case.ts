import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(private quizQuestionsRepository: QuizQuestionsRepository) {}

  async execute(command: DeleteQuestionCommand) {
    const foundQuestion = await this.quizQuestionsRepository.findQuestion(command.questionId);
    if (!foundQuestion) throw new NotFoundException('question not found');

    await this.quizQuestionsRepository.deleteQuestion(command.questionId);
  }
}
