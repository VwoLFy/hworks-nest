import { Blog, BlogDocument } from '../domain/blog.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findBlogById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async saveBlog(blog: BlogDocument) {
    await blog.save();
  }

  async deleteBlog(blogId: string) {
    await this.BlogModel.deleteOne({ _id: blogId });
  }

  async deleteAll() {
    await this.BlogModel.deleteMany();
  }
}
