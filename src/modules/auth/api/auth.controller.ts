import { UsersQueryRepo } from '../../users/infrastructure/users.queryRepo';
import { LoginSuccessViewModel } from './models/LoginSuccessViewModel';
import { PasswordRecoveryInputModel } from './models/PasswordRecoveryInputModel';
import { NewPasswordRecoveryDto } from '../application/dto/NewPasswordRecoveryDto';
import { RegistrationConfirmationCodeModel } from './models/RegistrationConfirmationCodeModel';
import { RegistrationEmailResendingModel } from './models/RegistrationEmailResendingModel';
import { MeViewModel } from './models/MeViewModel';
import { CreateUserDto } from '../../users/application/dto/CreateUserDto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserId } from '../../../main/decorators/user.decorator';
import { AttemptsGuard } from './guards/attempts.guard';
import { RefreshTokenGuard } from '../../../main/guards/refresh-token.guard';
import { SessionData } from '../../../main/decorators/session-data.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CheckLoginBodyFieldsGuard } from './guards/check-login-body-fields.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserCommand } from '../application/use-cases/register-user-use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email-use-case';
import { ResendRegistrationEmailCommand } from '../application/use-cases/resend-registration-email-use-case';
import { LoginUserCommand } from '../application/use-cases/login-user-use-case';
import { SendPasswordRecoveryCommand } from '../application/use-cases/send-password-recovery-email-use-case';
import { ChangePasswordCommand } from '../application/use-cases/change-password-use-case';
import { GenerateNewTokensCommand } from '../application/use-cases/generate-new-tokens-use-case';
import { DeleteSessionCommand } from '../../security/application/use-cases/delete-session-use-case';
import { SessionDto } from '../../security/application/dto/SessionDto';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(protected usersQueryRepo: UsersQueryRepo, private commandBus: CommandBus) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(CheckLoginBodyFieldsGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(200)
  async loginUser(
    @Ip() ip: string,
    @Headers('user-agent') title = 'unknown',
    @Res({ passthrough: true }) res: Response,
    @UserId() userId: string,
  ): Promise<LoginSuccessViewModel> {
    const { accessToken, refreshToken } = await this.commandBus.execute(new LoginUserCommand(userId, ip, title));

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('password-recovery')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() body: PasswordRecoveryInputModel) {
    await this.commandBus.execute(new SendPasswordRecoveryCommand(body.email));
  }

  @Post('new-password')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordRecoveryDto) {
    const isChangedPassword = await this.commandBus.execute(new ChangePasswordCommand(body));
    if (!isChangedPassword) throw new BadRequestException();
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(200)
  async refreshToken(
    @SessionData() sessionData: SessionDto,
    @Ip() ip: string,
    @Headers('user-agent') title = 'unknown',
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSuccessViewModel> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new GenerateNewTokensCommand(sessionData, ip, title),
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('registration')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registration(@Body() body: CreateUserDto) {
    await this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() body: RegistrationConfirmationCodeModel) {
    const isConfirm = await this.commandBus.execute(new ConfirmEmailCommand(body.code));
    if (!isConfirm) throw new BadRequestException([{ message: `Code isn't valid`, field: 'code' }]);
  }

  @Post('registration-email-resending')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() body: RegistrationEmailResendingModel) {
    const isResendEmail = await this.commandBus.execute(new ResendRegistrationEmailCommand(body.email));
    if (!isResendEmail)
      throw new BadRequestException([{ field: 'email', message: `Email isn't valid or already confirmed` }]);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async logout(@SessionData() sessionData: SessionDto, @Res({ passthrough: true }) res: Response) {
    await this.commandBus.execute(new DeleteSessionCommand(sessionData.userId, sessionData.deviceId));
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyInfo(@UserId() userId: string | null): Promise<MeViewModel> {
    const userData = await this.usersQueryRepo.findUserById(userId);
    return {
      email: userData.email,
      login: userData.login,
      userId: userData.id,
    };
  }
}
