import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CredentialsDto } from './dto/CredentialsDto';

@Injectable()
export class AuthService {
  constructor(protected usersRepository: UsersRepository) {}

  async checkCredentialsOfUser(dto: CredentialsDto): Promise<string | null> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(dto.loginOrEmail);
    if (
      !foundUser ||
      !foundUser.emailConfirmation.isConfirmed ||
      foundUser.banInfo.isBanned ||
      !(await this.passwordIsCorrect(dto.password, foundUser.accountData.passwordHash))
    )
      return null;
    return foundUser.id;
  }

  private async passwordIsCorrect(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }

  async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }
}
