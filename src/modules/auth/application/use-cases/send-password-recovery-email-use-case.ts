import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { PasswordRecoveryRepository } from '../../infrastructure/password-recovery.repository';
import { PasswordRecovery } from '../../domain/password-recovery.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendPasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendPasswordRecoveryCommand)
export class SendPasswordRecoveryEmailUseCase implements ICommandHandler<SendPasswordRecoveryCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailService,
    protected passwordRepository: PasswordRecoveryRepository,
  ) {}

  async execute(command: SendPasswordRecoveryCommand) {
    const { email } = command;

    const isUserExist = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!isUserExist) return;

    const passwordRecovery = new PasswordRecovery(email);
    await this.passwordRepository.savePassRecovery(passwordRecovery);

    try {
      await this.emailManager.sendEmailPasswordRecoveryMessage(email, passwordRecovery.recoveryCode);
    } catch (e) {
      console.log(e);
    }
  }
}
