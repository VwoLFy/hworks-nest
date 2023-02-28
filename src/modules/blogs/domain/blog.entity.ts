import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { BlogFromDB } from '../infrastructure/types/BlogFromDB';
import { randomUUID } from 'crypto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Blogs')
export class Blog {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
  @Column('uuid')
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;

  constructor({ ...dto }: CreateBlogDto, userId: string, userLogin: string) {
    this.id = randomUUID();
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.createdAt = new Date();
    this.isMembership = false;
    this.userId = userId;
    this.userLogin = userLogin;
    this.isBanned = false;
    this.banDate = null;
  }

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  setBan(isBanned: boolean) {
    this.isBanned = isBanned;

    if (isBanned) {
      this.banDate = new Date();
    } else {
      this.banDate = null;
    }
  }

  bindBlogWithUser(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }

  static createBlogFromDB(blogFromDB: BlogFromDB): Blog {
    const blog = new Blog(blogFromDB, blogFromDB.userId, blogFromDB.userLogin);
    blog.id = blogFromDB.id;
    blog.createdAt = blogFromDB.createdAt;
    blog.isMembership = blogFromDB.isMembership;
    blog.userId = blogFromDB.userId;
    blog.userLogin = blogFromDB.userLogin;
    blog.isBanned = blogFromDB.isBanned;
    blog.banDate = blogFromDB.banDate;

    return blog;
  }
}
