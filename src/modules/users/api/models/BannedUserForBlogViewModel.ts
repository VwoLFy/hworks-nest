import { BannedUserForBlog } from '../../domain/banned-user-for-blog.schema';

class BanInfoForBlog {
  isBanned: boolean;
  banDate: string;
  banReason: string;
  constructor(banReason: string, banDate: string) {
    this.isBanned = true;
    this.banReason = banReason;
    this.banDate = banDate;
  }
}

export class BannedUserForBlogViewModel {
  id: string;
  login: string;
  banInfo: BanInfoForBlog;
  constructor(bannedUser: BannedUserForBlog) {
    this.id = bannedUser.id;
    this.login = bannedUser.login;
    this.banInfo = new BanInfoForBlog(bannedUser.banReason, bannedUser.banDate.toISOString());
  }
}
