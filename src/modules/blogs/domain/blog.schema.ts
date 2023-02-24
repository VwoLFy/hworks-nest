import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { BlogFromDB } from '../infrastructure/types/BlogFromDB';
import { randomUUID } from 'crypto';

export class BlogOwnerInfo {
  userId: string;
  userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}
export class BanBlogInfo {
  isBanned: boolean;
  banDate: Date;

  constructor() {
    this.isBanned = false;
    this.banDate = null;
  }
}
export class Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfo;
  banBlogInfo: BanBlogInfo;

  constructor(dto: CreateBlogDto, userId: string, userLogin: string) {
    this.id = randomUUID();
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.createdAt = new Date();
    this.isMembership = false;
    this.blogOwnerInfo = new BlogOwnerInfo(userId, userLogin);
    this.banBlogInfo = new BanBlogInfo();
  }

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  setBan(isBanned: boolean) {
    this.banBlogInfo.isBanned = isBanned;

    if (isBanned) {
      this.banBlogInfo.banDate = new Date();
    } else {
      this.banBlogInfo.banDate = null;
    }
  }

  bindBlogWithUser(userId: string, userLogin: string) {
    this.blogOwnerInfo.userId = userId;
    this.blogOwnerInfo.userLogin = userLogin;
  }

  static createBlogFromDB(blogFromDB: BlogFromDB): Blog {
    const blog = new Blog(blogFromDB, blogFromDB.userId, blogFromDB.userLogin);
    blog.id = blogFromDB.id;
    blog.createdAt = blogFromDB.createdAt;
    blog.isMembership = blogFromDB.isMembership;
    blog.blogOwnerInfo.userId = blogFromDB.userId;
    blog.blogOwnerInfo.userLogin = blogFromDB.userLogin;
    blog.banBlogInfo.isBanned = blogFromDB.isBanned;
    blog.banBlogInfo.banDate = blogFromDB.banDate;

    return blog;
  }
}
