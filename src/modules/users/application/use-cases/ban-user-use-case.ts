import { UsersRepository } from '../../infrastructure/users.repository';
import { User, UserDocument } from '../../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');

    user.banUser(dto);

    await this.usersRepository.saveUser(user);
  }
}
