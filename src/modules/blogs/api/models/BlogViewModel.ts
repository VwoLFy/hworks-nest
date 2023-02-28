import { BlogFromDB } from '../../infrastructure/types/BlogFromDB';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  constructor(blogFromDB: BlogFromDB) {
    this.id = blogFromDB.id;
    this.name = blogFromDB.name;
    this.description = blogFromDB.description;
    this.websiteUrl = blogFromDB.websiteUrl;
    this.createdAt = blogFromDB.createdAt.toISOString();
    this.isMembership = blogFromDB.isMembership;
  }
}
