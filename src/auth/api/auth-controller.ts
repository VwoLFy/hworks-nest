import { AuthService } from '../application/auth-service';
import { ApiJwtService, RefreshTokenDataType } from '../application/jwt-service';
import { UsersQueryRepo } from '../../users/infrastructure/users-queryRepo';
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
import { AuthGuard } from './guards/auth.guard';
import { UserId } from '../../main/decorators/user.decorator';
import { AttemptsGuard } from './guards/attempts.guard';
import { RefreshTokenGuard } from '../../main/guards/refreshToken.guard';
import { Refreshtoken } from '../../main/decorators/refreshtoken.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CheckLoginBodyFieldsGuard } from './guards/check-login-body-fields.guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected jwtService: ApiJwtService,
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
    const { accessToken, refreshToken } = await this.authService.loginUser(userId, ip, title);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('password-recovery')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() body: PasswordRecoveryInputModel) {
    await this.authService.passwordRecoverySendEmail(body.email);
  }

  @Post('new-password')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordRecoveryDto) {
    const isChangedPassword = await this.authService.changePassword(body);
    if (!isChangedPassword) throw new BadRequestException();
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(200)
  async refreshToken(
    @Refreshtoken() refreshTokenData: RefreshTokenDataType,
    @Ip() ip: string,
    @Headers('user-agent') title = 'unknown',
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSuccessViewModel> {
    const { accessToken, refreshToken } = await this.jwtService.updateTokens(refreshTokenData, ip, title);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('registration')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registration(@Body() body: CreateUserDto) {
    const isRegistered = await this.authService.createUser(body);
    if (!isRegistered) throw new BadRequestException();
  }

  @Post('registration-confirmation')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() body: RegistrationConfirmationCodeModel) {
    const isConfirm = await this.authService.confirmEmail(body.code);
    if (!isConfirm) throw new BadRequestException();
  }

  @Post('registration-email-resending')
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() body: RegistrationEmailResendingModel) {
    const isResendEmail = await this.authService.registrationResendEmail(body.email);
    if (!isResendEmail) throw new BadRequestException();
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @UseGuards(AttemptsGuard)
  @HttpCode(204)
  async logout(@Refreshtoken() refreshTokenData: RefreshTokenDataType, @Res({ passthrough: true }) res: Response) {
    await this.jwtService.deleteRefreshToken(refreshTokenData);
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @UseGuards(AuthGuard)
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
