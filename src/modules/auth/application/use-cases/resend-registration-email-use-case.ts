import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

export class ResendRegistrationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase implements ICommandHandler<ResendRegistrationEmailCommand> {
  constructor(protected usersRepository: UsersRepository, protected emailService: EmailService) {}

  async execute(command: ResendRegistrationEmailCommand) {
    const { email } = command;

    const foundUser = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!foundUser || foundUser.emailConfirmation.isConfirmed)
      throw new BadRequestException([{ field: 'email', message: `Email isn't valid or already confirmed` }]);

    foundUser.updateEmailConfirmation();
    await this.usersRepository.saveUser(foundUser);

    await this.emailService.sendEmailConfirmationMessage(email, foundUser.emailConfirmation.confirmationCode);
  }
}
