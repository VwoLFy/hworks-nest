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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserId } from '../../main/decorators/user.decorator';
import { AttemptsGuard } from './guards/attempts.guard';
import { RefreshTokenGuard } from '../../main/guards/refresh-token.guard';
import { SessionData } from '../../main/decorators/session-data.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CheckLoginBodyFieldsGuard } from './guards/check-login-body-fields.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserUseCase } from '../application/use-cases/register-user-use-case';
import { ConfirmEmailUseCase } from '../application/use-cases/confirm-email-use-case';
import { ResendRegistrationEmailUseCase } from '../application/use-cases/resend-registration-email-use-case';
import { CreateSessionUseCase } from '../../security/application/use-cases/create-session-use-case';
import { SendPasswordRecoveryEmailUseCase } from '../application/use-cases/send-password-recovery-email-use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password-use-case';
import { UpdateSessionUseCase } from '../../security/application/use-cases/update-session-use-case';
import { DeleteSessionUseCase } from '../../security/application/use-cases/delete-session-use-case';
import { SessionDto } from '../../security/application/dto/SessionDto';

@Controller('auth')
export class AuthController {
  constructor(
    protected registerUserUseCase: RegisterUserUseCase,
    protected confirmEmailUseCase: ConfirmEmailUseCase,
    protected resendRegistrationEmailUseCase: ResendRegistrationEmailUseCase,
    protected createSessionUseCase: CreateSessionUseCase,
    protected sendPasswordRecoveryEmailUseCase: SendPasswordRecoveryEmailUseCase,
    protected changePasswordUseCase: ChangePasswordUseCase,
    protected updateSessionUseCase: UpdateSessionUseCase,
    protected deleteSessionUseCase: DeleteSessionUseCase,
    protected usersQueryRepo: UsersQueryRepo,
  ) {}

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
    const { accessToken, refreshToken } = await this.createSessionUseCase.execute(userId, ip, title);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('password-recovery')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() body: PasswordRecoveryInputModel) {
    await this.sendPasswordRecoveryEmailUseCase.execute(body.email);
  }

  @Post('new-password')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordRecoveryDto) {
    const isChangedPassword = await this.changePasswordUseCase.execute(body);
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
    const { accessToken, refreshToken } = await this.updateSessionUseCase.execute(sessionData, ip, title);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('registration')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registration(@Body() body: CreateUserDto) {
    const isRegistered = await this.registerUserUseCase.execute(body);
    if (!isRegistered) throw new BadRequestException();
  }

  @Post('registration-confirmation')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() body: RegistrationConfirmationCodeModel) {
    const isConfirm = await this.confirmEmailUseCase.execute(body.code);
    if (!isConfirm) throw new BadRequestException([{ field: 'code', message: `Code isn't valid` }]);
  }

  @Post('registration-email-resending')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() body: RegistrationEmailResendingModel) {
    const isResendEmail = await this.resendRegistrationEmailUseCase.execute(body.email);
    if (!isResendEmail)
      throw new BadRequestException([{ field: 'email', message: `Email isn't valid or already confirmed` }]);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async logout(@SessionData() sessionData: SessionDto, @Res({ passthrough: true }) res: Response) {
    await this.deleteSessionUseCase.execute(sessionData.userId, sessionData.deviceId);
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyInfo(@UserId() userId: string | null): Promise<MeViewModel> {
    const userData = await this.usersQueryRepo.findUserById(userId);
    if (!userData) throw new UnauthorizedException();
    return {
      email: userData.email,
      login: userData.login,
      userId: userData.id,
    };
  }
}
