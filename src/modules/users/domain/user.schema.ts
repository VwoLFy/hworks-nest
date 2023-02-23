import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { BanUserDto } from '../application/dto/BanUserDto';
import { UserFromDB } from '../infrastructure/dto/UserFromDB';

export class AccountData {
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;

  constructor(login: string, passwordHash: string, email: string) {
    this.createdAt = new Date();
    this.login = login;
    this.passwordHash = passwordHash;
    this.email = email;
  }
}

export class EmailConfirmation {
  isConfirmed: boolean;
  confirmationCode: string;
  codeExpirationDate: Date;

  constructor(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
    if (isConfirmed) {
      this.confirmationCode = null;
      this.codeExpirationDate = null;
    } else {
      this.confirmationCode = randomUUID();
      this.codeExpirationDate = add(new Date(), { hours: 1 });
    }
  }
}

export class BanInfo {
  isBanned: boolean;
  banDate: Date;
  banReason: string;

  constructor() {
    this.isBanned = false;
    this.banDate = null;
    this.banReason = null;
  }
}

export class User {
  id: string;
  accountData: AccountData;
  emailConfirmation: EmailConfirmation;
  banInfo: BanInfo;

  constructor(login: string, passwordHash: string, email: string, isConfirmed: boolean) {
    this.id = randomUUID();
    this.accountData = new AccountData(login, passwordHash, email);
    this.emailConfirmation = new EmailConfirmation(isConfirmed);
    this.banInfo = new BanInfo();
  }

  static createUserFromDB(userFromDB: UserFromDB): User {
    const user = new User(userFromDB.login, userFromDB.passwordHash, userFromDB.email, userFromDB.isConfirmed);
    user.id = userFromDB.id;
    user.accountData.createdAt = userFromDB.createdAt;
    user.emailConfirmation.confirmationCode = userFromDB.confirmationCode;
    user.emailConfirmation.codeExpirationDate = userFromDB.codeExpirationDate;
    user.banInfo.isBanned = userFromDB.isBanned;
    user.banInfo.banDate = userFromDB.banDate;
    user.banInfo.banReason = userFromDB.banReason;
    return user;
  }

  confirmUser() {
    this.emailConfirmation.isConfirmed = true;
  }

  updateEmailConfirmation() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.codeExpirationDate = add(new Date(), { hours: 1 });
  }

  updatePassword(passwordHash: string) {
    this.accountData.passwordHash = passwordHash;
  }

  banUser(dto: BanUserDto) {
    this.banInfo.isBanned = dto.isBanned;

    if (dto.isBanned) {
      this.banInfo.banReason = dto.banReason;
      this.banInfo.banDate = new Date();
    } else {
      this.banInfo.banReason = null;
      this.banInfo.banDate = null;
    }
  }
}
