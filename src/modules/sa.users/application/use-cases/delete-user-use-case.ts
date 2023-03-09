import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    const foundUser = await this.usersRepository.findUserById(command.userId);
    if (!foundUser) throw new NotFoundException('user not found');

    await this.usersRepository.deleteUser(command.userId);
  }
}
