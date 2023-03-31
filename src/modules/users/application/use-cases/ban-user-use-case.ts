import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(protected usersRepository: UsersRepository, protected securityRepository: SecurityRepository) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const alreadyIsBanned = await this.banUser(userId, dto);
    if (alreadyIsBanned) return;

    await this.banUserSessions(userId, dto.isBanned);
  }

  private async banUser(userId: string, dto: BanUserDto): Promise<boolean> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');
    if (user.banInfo.isBanned === dto.isBanned) return true;

    user.banUser(dto);
    await this.usersRepository.saveUser(user);
    return false;
  }

  private async banUserSessions(userId: string, isBanned: boolean) {
    if (isBanned) await this.securityRepository.deleteAllUserSessions(userId);
  }
}
