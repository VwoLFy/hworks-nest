import { BanUserInfoViewModel } from './BanUserInfoViewModel';

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanUserInfoViewModel;
};
