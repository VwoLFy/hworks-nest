import { PublishQuestionDto } from '../dto/PublishQuestionDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';
import { NotFoundException } from '@nestjs/common';

export class PublishQuestionCommand {
  constructor(public questionId: string, public dto: PublishQuestionDto) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(private quizQuestionsRepository: QuizQuestionsRepository) {}

  async execute(command: PublishQuestionCommand) {
    const foundQuestion = await this.quizQuestionsRepository.findQuestion(command.questionId);
    if (!foundQuestion) throw new NotFoundException('question not found');

    foundQuestion.publish(command.dto.published);
    await this.quizQuestionsRepository.save(foundQuestion);
  }
}
