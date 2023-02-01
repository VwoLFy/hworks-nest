import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const { confirmationCode } = command;

    const foundUser = await this.usersRepository.findUserByConfirmationCode(confirmationCode);
    if (!foundUser) return false;

    const { emailConfirmation } = foundUser;
    if (emailConfirmation.isConfirmed) return false;
    if (emailConfirmation.expirationDate < new Date()) return false;
    if (emailConfirmation.confirmationCode !== confirmationCode) return false;

    foundUser.confirmUser();
    await this.usersRepository.saveUser(foundUser);
    return true;
  }
}
