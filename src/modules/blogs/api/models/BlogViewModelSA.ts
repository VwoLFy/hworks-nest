import { BlogDocument } from '../../domain/blog.schema';
import { BlogOwnerInfoViewModel } from './BlogOwnerInfoViewModel';

export class BlogViewModelSA {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfoViewModel;

  constructor(blog: BlogDocument) {
    this.id = blog.id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt.toISOString();
    this.isMembership = blog.isMembership;
    this.blogOwnerInfo = blog.blogOwnerInfo;
  }
}
