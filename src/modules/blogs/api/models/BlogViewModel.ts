import { Blog } from '../../domain/blog.entity';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  constructor(blog: Blog) {
    this.id = blog.id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt.toISOString();
    this.isMembership = blog.isMembership;
  }
}
