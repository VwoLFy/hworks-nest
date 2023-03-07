import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../email.service';
import { User } from '../../../users/domain/user.entity';
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
    protected emailService: EmailService,
    private authService: AuthService,
  ) {}

  async execute(command: RegisterUserCommand) {
    const { login, password, email } = command.dto;
    console.log('start create user ------  ' + new Date());
    const passwordHash = await this.authService.getPasswordHash(password);

    const user = new User(login, passwordHash, email, false);
    await this.usersRepository.saveUser(user);
    console.log('end create user ------  ' + new Date());

    await this.emailService.sendEmailConfirmationMessage(email, user.emailConfirmation.confirmationCode);
    console.log('end sending email ------  ' + new Date());
  }
}
