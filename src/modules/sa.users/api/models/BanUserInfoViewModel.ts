import { BanInfo } from '../../../users/domain/user.ban-info.entity';

export class BanUserInfoViewModel {
  isBanned: boolean;
  banDate: string;
  banReason: string;

  constructor(banInfo: BanInfo) {
    this.isBanned = banInfo.isBanned;
    this.banReason = banInfo.banReason;
    this.banDate = banInfo.banDate === null ? null : banInfo.banDate.toISOString();
  }
}
