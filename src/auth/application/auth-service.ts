import { UsersRepository } from '../../users/infrastructure/users-repository';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email.service';
import { ApiJwtService } from './jwt-service';
import { SecurityService } from '../../security/application/security-service';
import { CreateUserDto } from '../../users/application/dto/CreateUserDto';
import { PasswordRecovery, PasswordRecoveryDocument } from '../domain/password-recovery.schema';
import { AccountData, EmailConfirmation, User, UserDocument } from '../../users/domain/user.schema';
import { CredentialsDto } from './dto/CredentialsDto';
import { NewPasswordRecoveryDto } from './dto/NewPasswordRecoveryDto';
import { PasswordRecoveryRepository } from '../infrastructure/password-recovery-repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: ApiJwtService,
    protected usersRepository: UsersRepository,
    protected emailManager: EmailService,
    protected passwordRepository: PasswordRecoveryRepository,
    protected securityService: SecurityService,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(PasswordRecovery.name) private PasswordRecoveryModel: Model<PasswordRecoveryDocument>,
  ) {}

  async checkCredentials(dto: CredentialsDto): Promise<string | null> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(dto.loginOrEmail);
    if (
      !foundUser ||
      !foundUser.emailConfirmation.isConfirmed ||
      !(await bcrypt.compare(dto.password, foundUser.accountData.passwordHash))
    )
      return null;
    return foundUser.id;
  }

  async createUser(dto: CreateUserDto): Promise<boolean> {
    const { login, password, email } = dto;
    const passwordHash = await this.getPasswordHash(password);

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

  async confirmEmail(confirmationCode: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findUserByConfirmationCode(confirmationCode);
    if (!foundUser) return false;

    await foundUser.confirmUser();
    await this.usersRepository.saveUser(foundUser);
    return true;
  }

  async registrationResendEmail(email: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) return false;

    foundUser.updateEmailConfirmation();

    try {
      await this.emailManager.sendEmailConfirmationMessage(email, foundUser.emailConfirmation.confirmationCode);
      await this.usersRepository.saveUser(foundUser);
    } catch (e) {
      console.log(e);
      await this.usersRepository.deleteUser(foundUser._id);
      return false;
    }
    return true;
  }

  async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  async loginUser(userId: string, ip: string, title: string) {
    const tokens = await this.jwtService.createJWT(userId, null);
    const refreshTokenData = await this.jwtService.getRefreshTokenData(tokens.refreshToken);
    await this.securityService.saveSession({ ...refreshTokenData, ip, title });
    return tokens;
  }

  async passwordRecoverySendEmail(email: string) {
    const isUserExist = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!isUserExist) return;

    const passwordRecovery = new this.PasswordRecoveryModel({ email });
    await this.passwordRepository.savePassRecovery(passwordRecovery);

    try {
      await this.emailManager.sendEmailPasswordRecoveryMessage(email, passwordRecovery.recoveryCode);
    } catch (e) {
      console.log(e);
    }
  }

  async changePassword(dto: NewPasswordRecoveryDto): Promise<boolean> {
    const { newPassword, recoveryCode } = dto;

    const passwordRecovery = await this.passwordRepository.findPassRecovery(recoveryCode);
    if (!passwordRecovery) return false;

    if (new Date() > passwordRecovery.expirationDate) {
      await this.passwordRepository.deletePassRecovery(recoveryCode);
      return false;
    }

    const foundUser = await this.usersRepository.findUserByLoginOrEmail(passwordRecovery.email);
    if (!foundUser) return false;

    const passwordHash = await this.getPasswordHash(newPassword);

    foundUser.updatePassword(passwordHash);
    await this.usersRepository.saveUser(foundUser);

    await this.passwordRepository.deletePassRecovery(recoveryCode);
    return true;
  }
}
