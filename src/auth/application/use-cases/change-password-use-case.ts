import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordRecoveryRepository } from '../../infrastructure/password-recovery.repository';
import { NewPasswordRecoveryDto } from '../dto/NewPasswordRecoveryDto';
import { AuthService } from '../auth.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected passwordRepository: PasswordRecoveryRepository,
    protected authService: AuthService,
  ) {}

  async execute(dto: NewPasswordRecoveryDto): Promise<boolean> {
    const { newPassword, recoveryCode } = dto;

    const passwordRecovery = await this.passwordRepository.findPassRecovery(recoveryCode);
    if (!passwordRecovery) return false;

    if (new Date() > passwordRecovery.expirationDate) {
      await this.passwordRepository.deletePassRecovery(recoveryCode);
      return false;
    }

    const foundUser = await this.usersRepository.findUserByLoginOrEmail(passwordRecovery.email);
    if (!foundUser) return false;

    const passwordHash = await this.authService.getPasswordHash(newPassword);

    foundUser.updatePassword(passwordHash);
    await this.usersRepository.saveUser(foundUser);

    await this.passwordRepository.deletePassRecovery(recoveryCode);
    return true;
  }
}
