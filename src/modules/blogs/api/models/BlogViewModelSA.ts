import { BlogDocument } from '../../domain/blog.schema';
import { BlogOwnerInfoViewModelSA } from './BlogOwnerInfoViewModelSA';
import { BanBlogInfoViewModelSA } from './BanBlogInfoViewModelSA';

export class BlogViewModelSA {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfoViewModelSA;
  banInfo: BanBlogInfoViewModelSA;

  constructor(blog: BlogDocument) {
    this.id = blog.id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt.toISOString();
    this.isMembership = blog.isMembership;
    this.blogOwnerInfo = blog.blogOwnerInfo;
    this.banInfo = new BanBlogInfoViewModelSA(blog.banBlogInfo);
  }
}
