import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { User, UserDocument } from '../../../users/domain/user.schema';
import { CreateUserDto } from '../../../users/application/dto/CreateUserDto';
import { AuthService } from '../auth.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailService: EmailService,
    private authService: AuthService,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async execute(command: RegisterUserCommand) {
    const { login, password, email } = command.dto;
    const passwordHash = await this.authService.getPasswordHash(password);

    const user = new User(login, passwordHash, email, false);
    const userModel = new this.UserModel(user);

    try {
      await this.emailService.sendEmailConfirmationMessage(email, user.emailConfirmation.confirmationCode);
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
    }

    await this.usersRepository.saveUser(userModel);
  }
}
