import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/CreateQuestionDto';
import { QuizQuestion } from '../../domain/quiz-question.entity';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private quizRepository: QuizQuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const question = new QuizQuestion(command.dto);
    await this.quizRepository.save(question);
    return question.id;
  }
}
