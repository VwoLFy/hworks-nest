import { BlogOwnerInfoViewModelSA } from './BlogOwnerInfoViewModelSA';
import { BanBlogInfoViewModelSA } from './BanBlogInfoViewModelSA';
import { BlogFromDB } from '../../infrastructure/types/BlogFromDB';

export class BlogViewModelSA {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfoViewModelSA;
  banInfo: BanBlogInfoViewModelSA;

  constructor(blogFromDB: BlogFromDB) {
    this.id = blogFromDB.id;
    this.name = blogFromDB.name;
    this.description = blogFromDB.description;
    this.websiteUrl = blogFromDB.websiteUrl;
    this.createdAt = blogFromDB.createdAt.toISOString();
    this.isMembership = blogFromDB.isMembership;
    this.blogOwnerInfo = new BlogOwnerInfoViewModelSA(blogFromDB.userId, blogFromDB.userLogin);
    this.banInfo = new BanBlogInfoViewModelSA(blogFromDB.isBanned, blogFromDB.banDate);
  }
}
