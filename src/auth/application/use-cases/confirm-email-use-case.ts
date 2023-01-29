import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

@Injectable()
export class ConfirmEmailUseCase {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(confirmationCode: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findUserByConfirmationCode(confirmationCode);
    if (!foundUser) return false;

    foundUser.confirmUser();
    await this.usersRepository.saveUser(foundUser);
    return true;
  }
}
