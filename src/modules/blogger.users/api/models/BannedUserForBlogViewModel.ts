import { BannedUserForBlog } from '../../domain/banned-user-for-blog.entity';

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
  constructor(bannedUserForBlog: BannedUserForBlog) {
    this.id = bannedUserForBlog.userId;
    this.login = bannedUserForBlog.userLogin;
    this.banInfo = new BanInfoForBlog(bannedUserForBlog.banReason, bannedUserForBlog.banDate.toISOString());
  }
}
