import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CredentialsDto } from '../dto/CredentialsDto';

@Injectable()
export class CheckCredentialsOfUserUseCase {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(dto: CredentialsDto): Promise<string | null> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(dto.loginOrEmail);
    if (
      !foundUser ||
      !foundUser.emailConfirmation.isConfirmed ||
      !(await this.passwordIsCorrect(dto.password, foundUser.accountData.passwordHash))
    )
      return null;
    return foundUser.id;
  }
  private async passwordIsCorrect(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }
}
