import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/CreateQuestionDto';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  async execute(command: CreateQuestionCommand): Promise<any> {
    return command.dto;
  }
}
