import { BannedUserForBlogFromDB } from '../../infrastructure/types/BannedUserForBlogFromDB';

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
  constructor(bannedUserForBlogFromDB: BannedUserForBlogFromDB) {
    this.id = bannedUserForBlogFromDB.userId;
    this.login = bannedUserForBlogFromDB.userLogin;
    this.banInfo = new BanInfoForBlog(bannedUserForBlogFromDB.banReason, bannedUserForBlogFromDB.banDate.toISOString());
  }
}
