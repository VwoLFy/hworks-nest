import { BanUserInfoViewModel } from './BanUserInfoViewModel';
import { User } from '../../domain/user.schema';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanUserInfoViewModel;

  constructor(dto: User) {
    this.id = dto._id.toString();
    this.login = dto.accountData.login;
    this.email = dto.accountData.email;
    this.createdAt = dto.accountData.createdAt.toISOString();
    this.banInfo = new BanUserInfoViewModel(dto.banInfo);
  }
}
