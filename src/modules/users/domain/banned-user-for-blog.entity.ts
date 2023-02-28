import { BannedUserForBlogFromDB } from '../infrastructure/types/BannedUserForBlogFromDB';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('BannedUsersForBlog')
export class BannedUserForBlog {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  banReason: string;
  @Column()
  banDate: Date;
  @Column('uuid')
  blogId: string;

  constructor(blogId: string, userId: string, userLogin: string, banReason: string) {
    this.id = userId;
    this.login = userLogin;
    this.banReason = banReason;
    this.banDate = new Date();
    this.blogId = blogId;
  }

  static createBannedUserForBlog(user: BannedUserForBlogFromDB): BannedUserForBlog {
    const bannedUserForBlog = new BannedUserForBlog(user.blogId, user.id, user.login, user.banReason);
    bannedUserForBlog.banDate = user.banDate;
    return user;
  }
}
