import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { AccountData, EmailConfirmation, User, UserDocument } from '../../../users/domain/user.schema';
import { CreateUserDto } from '../../../users/application/dto/CreateUserDto';
import { AuthService } from '../auth.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailService,
    private authService: AuthService,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async execute(command: RegisterUserCommand): Promise<boolean> {
    const { login, password, email } = command.dto;
    const passwordHash = await this.authService.getPasswordHash(password);

    const accountData = new AccountData(login, passwordHash, email);
    const emailConfirmation = new EmailConfirmation(false);
    const user = new this.UserModel({ accountData, emailConfirmation });

    try {
      await this.emailManager.sendEmailConfirmationMessage(email, user.emailConfirmation.confirmationCode);
    } catch (e) {
      console.log(e);
      return false;
    }

    await this.usersRepository.saveUser(user);
    return true;
  }
}
