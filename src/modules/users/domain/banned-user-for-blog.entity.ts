import { BannedUserForBlogFromDB } from '../infrastructure/types/BannedUserForBlogFromDB';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('BannedUsersForBlogs')
export class BannedUserForBlog {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column('uuid')
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  banReason: string;
  @Column()
  banDate: Date;
  @Column('uuid')
  blogId: string;

  constructor(blogId: string, userId: string, userLogin: string, banReason: string) {
    this.userId = userId;
    this.userLogin = userLogin;
    this.banReason = banReason;
    this.banDate = new Date();
    this.blogId = blogId;
  }

  static createBannedUserForBlog(user: BannedUserForBlogFromDB): BannedUserForBlog {
    const bannedUserForBlog = new BannedUserForBlog(user.blogId, user.userId, user.userLogin, user.banReason);
    bannedUserForBlog.banDate = user.banDate;
    bannedUserForBlog.id = user.id;
    return user;
  }
}
