import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { BanUserDto } from '../../sa.users/application/dto/BanUserDto';
import { Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { BanInfo } from './user.ban-info.entity';
import { EmailConfirmation } from './user.email-confirmation.entity';
import { AccountData } from './user.account-data.entity';

@Entity('Users')
export class User {
  @PrimaryColumn('uuid')
  id: string;
  @OneToOne(() => AccountData, (a) => a.user, { cascade: true, eager: true })
  accountData: AccountData;
  @OneToOne(() => EmailConfirmation, (e) => e.user, { cascade: true, eager: true })
  emailConfirmation: EmailConfirmation;
  @OneToOne(() => BanInfo, (b) => b.user, { cascade: true, eager: true })
  banInfo: BanInfo;

  constructor(login: string, passwordHash: string, email: string, isConfirmed: boolean) {
    this.id = randomUUID();
    this.accountData = new AccountData(login, passwordHash, email);
    this.emailConfirmation = new EmailConfirmation(isConfirmed);
    this.banInfo = new BanInfo();
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
