import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';

@Injectable()
export class ResendRegistrationEmailUseCase {
  constructor(protected usersRepository: UsersRepository, protected emailManager: EmailService) {}

  async execute(email: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) return false;

    foundUser.updateEmailConfirmation();

    try {
      await this.emailManager.sendEmailConfirmationMessage(email, foundUser.emailConfirmation.confirmationCode);
      await this.usersRepository.saveUser(foundUser);
    } catch (e) {
      console.log(e);
      await this.usersRepository.deleteUser(foundUser._id);
      return false;
    }
    return true;
  }
}
