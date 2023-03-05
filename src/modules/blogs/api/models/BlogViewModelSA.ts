import { BlogOwnerInfoViewModelSA } from './BlogOwnerInfoViewModelSA';
import { BanBlogInfoViewModelSA } from './BanBlogInfoViewModelSA';
import { Blog } from '../../domain/blog.entity';

export class BlogViewModelSA {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfoViewModelSA;
  banInfo: BanBlogInfoViewModelSA;

  constructor(blog: Blog) {
    this.id = blog.id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt.toISOString();
    this.isMembership = blog.isMembership;
    this.blogOwnerInfo = new BlogOwnerInfoViewModelSA(blog.userId, blog.userLogin);
    this.banInfo = new BanBlogInfoViewModelSA(blog.isBanned, blog.banDate);
  }
}
