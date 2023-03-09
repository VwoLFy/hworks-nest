import { EmailService } from '../email.service';
import { CreateUserDto } from '../../../users/application/dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../users/application/users.service';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(protected usersService: UsersService, protected emailService: EmailService) {}

  async execute(command: RegisterUserCommand) {
    const user = await this.usersService.createUser(command.dto, false);
    await this.emailService.sendEmailConfirmationMessage(command.dto.email, user.emailConfirmation.confirmationCode);
  }
}
