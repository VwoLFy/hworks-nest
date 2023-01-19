import { AuthService } from '../application/auth-service';
import { AppJwtService } from '../application/jwt-service';
import { UsersQueryRepo } from '../../users/infrastructure/users-queryRepo';
import { CredentialsDto } from '../application/dto/CredentialsDto';
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
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '../../auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected jwtService: AppJwtService,
    protected usersQueryRepo: UsersQueryRepo,
  ) {}

  @Post('login')
  @HttpCode(200)
  async loginUser(
    @Body() body: CredentialsDto,
    @Ip() ip,
    @Headers() headers,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSuccessViewModel> {
    const title = headers['user-agent'] || 'unknown';
    const userId = await this.authService.checkCredentials(body);
    if (!userId) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.authService.loginUser(userId, ip, title);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() body: PasswordRecoveryInputModel) {
    await this.authService.passwordRecoverySendEmail(body.email);
  }

  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordRecoveryDto) {
    const isChangedPassword = await this.authService.changePassword(body);
    if (!isChangedPassword) throw new BadRequestException();
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<LoginSuccessViewModel> {
    const title = req.headers['user-agent'] || 'unknown';

    const { accessToken, refreshToken } = await this.jwtService.updateTokens(req.refreshTokenData, req.ip, title);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() body: CreateUserDto) {
    const isRegistered = await this.authService.createUser(body);
    if (!isRegistered) throw new BadRequestException();
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() body: RegistrationConfirmationCodeModel) {
    const isConfirm = await this.authService.confirmEmail(body.code);
    if (!isConfirm) throw new BadRequestException();
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() body: RegistrationEmailResendingModel) {
    const isResendEmail = await this.authService.registrationResendEmail(body.email);
    if (!isResendEmail) throw new BadRequestException();
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.jwtService.deleteRefreshToken(req.refreshTokenData);
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() req: Request): Promise<MeViewModel> {
    const userId = req.userId;
    const userData = await this.usersQueryRepo.findUserById(userId);
    if (!userData) throw new UnauthorizedException();
    return {
      email: userData.email,
      login: userData.login,
      userId: userData.id,
    };
  }
}
