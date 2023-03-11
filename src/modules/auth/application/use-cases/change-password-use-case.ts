import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordRecoveryRepository } from '../../infrastructure/password-recovery.repository';
import { NewPasswordRecoveryDto } from '../dto/NewPasswordRecoveryDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

export class ChangePasswordCommand {
  constructor(public dto: NewPasswordRecoveryDto) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase implements ICommandHandler<ChangePasswordCommand> {
  constructor(protected usersRepository: UsersRepository, protected passwordRepository: PasswordRecoveryRepository) {}

  async execute(command: ChangePasswordCommand): Promise<boolean> {
    const { newPassword, recoveryCode } = command.dto;

    const passwordRecovery = await this.passwordRepository.findPassRecovery(recoveryCode);
    if (!passwordRecovery) return false;

    if (new Date() > passwordRecovery.expirationDate) {
      await this.passwordRepository.deletePassRecovery(recoveryCode);
      return false;
    }

    const foundUser = await this.usersRepository.findUserByLoginOrEmail(passwordRecovery.email);
    if (!foundUser) return false;

    const passwordHash = await this.getPasswordHash(newPassword);

    foundUser.updatePassword(passwordHash);
    await this.usersRepository.saveUser(foundUser);

    await this.passwordRepository.deletePassRecovery(recoveryCode);
    return true;
  }

  private async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }
}
