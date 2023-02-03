import { BlogDocument } from '../../domain/blog.schema';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;

  constructor(blog: BlogDocument) {
    this.id = blog.id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt.toISOString();
  }
}
