import { CreateUserDto } from '../../../users/application/dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../users/application/users.service';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(protected usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const user = await this.usersService.createUser(command.dto, true);
    return user.id;
  }
}
