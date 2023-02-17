import { BanInfo } from '../../domain/user.schema';

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
