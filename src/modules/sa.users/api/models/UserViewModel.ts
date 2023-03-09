import { BanUserInfoViewModel } from './BanUserInfoViewModel';
import { User } from '../../../users/domain/user.entity';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanUserInfoViewModel;

  constructor(dto: User) {
    this.id = dto.id;
    this.login = dto.accountData.login;
    this.email = dto.accountData.email;
    this.createdAt = dto.accountData.createdAt.toISOString();
    this.banInfo = new BanUserInfoViewModel(dto.banInfo);
  }
}
