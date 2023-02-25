import { BannedUserForBlogFromDB } from '../infrastructure/types/BannedUserForBlogFromDB';

export class BannedUserForBlog {
  id: string;
  login: string;
  banReason: string;
  banDate: Date;
  blogId: string;

  constructor(blogId: string, userId: string, userLogin: string, banReason: string) {
    this.blogId = blogId;
    this.id = userId;
    this.login = userLogin;
    this.banReason = banReason;
    this.banDate = new Date();
  }

  static createBannedUserForBlog(user: BannedUserForBlogFromDB): BannedUserForBlog {
    const bannedUserForBlog = new BannedUserForBlog(user.blogId, user.id, user.login, user.banReason);
    bannedUserForBlog.banDate = user.banDate;
    return user;
  }
}
