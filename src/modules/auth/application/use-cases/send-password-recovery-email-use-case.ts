import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { PasswordRecoveryRepository } from '../../infrastructure/password-recovery.repository';
import { PasswordRecovery, PasswordRecoveryDocument } from '../../domain/password-recovery.schema';
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
    @InjectModel(PasswordRecovery.name) private PasswordRecoveryModel: Model<PasswordRecoveryDocument>,
  ) {}

  async execute(command: SendPasswordRecoveryCommand) {
    const { email } = command;

    const isUserExist = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!isUserExist) return;

    const passwordRecovery = new PasswordRecovery(email);
    const passwordRecoveryModel = new this.PasswordRecoveryModel(passwordRecovery);
    await this.passwordRepository.savePassRecovery(passwordRecoveryModel);

    try {
      await this.emailManager.sendEmailPasswordRecoveryMessage(email, passwordRecoveryModel.recoveryCode);
    } catch (e) {
      console.log(e);
    }
  }
}
