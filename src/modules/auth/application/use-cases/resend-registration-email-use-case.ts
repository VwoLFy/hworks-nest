import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ResendRegistrationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase implements ICommandHandler<ResendRegistrationEmailCommand> {
  constructor(protected usersRepository: UsersRepository, protected emailService: EmailService) {}

  async execute(command: ResendRegistrationEmailCommand): Promise<boolean> {
    const { email } = command;

    const foundUser = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) return false;

    foundUser.updateEmailConfirmation();

    try {
      await this.emailService.sendEmailConfirmationMessage(email, foundUser.emailConfirmation.confirmationCode);
      await this.usersRepository.saveUser(foundUser);
    } catch (e) {
      console.log(e);
      await this.usersRepository.deleteUser(foundUser.id);
      return false;
    }
    return true;
  }
}
