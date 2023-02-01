import { UsersRepository } from '../../infrastructure/users.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/CreateUserDto';
import { User, AccountData, UserDocument, EmailConfirmation } from '../../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { login, password, email } = command.dto;

    const passwordHash = await this.getPasswordHash(password);

    const accountData = new AccountData(login, passwordHash, email);
    const emailConfirmation = new EmailConfirmation(true);
    const user = new this.UserModel({ accountData, emailConfirmation });

    await this.usersRepository.saveUser(user);
    return user.id;
  }

  private async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }
}
