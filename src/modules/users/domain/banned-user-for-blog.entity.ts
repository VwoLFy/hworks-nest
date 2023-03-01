import { BannedUserForBlogFromDB } from '../infrastructure/types/BannedUserForBlogFromDB';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Blog } from '../../blogs/domain/blog.entity';

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
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Blog)
  blog: Blog;

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
    return bannedUserForBlog;
  }
}
//redeploy
