import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { PasswordRecoveryRepository } from '../../infrastructure/password-recovery.repository';
import { PasswordRecovery, PasswordRecoveryDocument } from '../../domain/password-recovery.schema';

@Injectable()
export class SendPasswordRecoveryEmailUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailService,
    protected passwordRepository: PasswordRecoveryRepository,
    @InjectModel(PasswordRecovery.name) private PasswordRecoveryModel: Model<PasswordRecoveryDocument>,
  ) {}

  async execute(email: string) {
    const isUserExist = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!isUserExist) return;

    const passwordRecovery = new this.PasswordRecoveryModel({ email });
    await this.passwordRepository.savePassRecovery(passwordRecovery);

    try {
      await this.emailManager.sendEmailPasswordRecoveryMessage(email, passwordRecovery.recoveryCode);
    } catch (e) {
      console.log(e);
    }
  }
}
