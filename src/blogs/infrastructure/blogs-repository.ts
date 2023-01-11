import { Blog, BlogDocument } from '../domain/blog.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findBlogById(_id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById({ _id });
  }
  async findBlogNameById(_id: string): Promise<string | null> {
    const foundBlog = await this.BlogModel.findById({ _id }).lean();
    return foundBlog ? foundBlog.name : null;
  }
  async saveBlog(blog: BlogDocument) {
    await blog.save();
  }
  async deleteBlog(_id: string): Promise<boolean> {
    const result = await this.BlogModel.deleteOne({ _id });
    return result.deletedCount !== 0;
  }
  async deleteAll() {
    await this.BlogModel.deleteMany({});
  }
}
