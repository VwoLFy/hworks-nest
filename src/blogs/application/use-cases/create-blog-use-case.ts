import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';

@Injectable()
export class CreateBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(dto: CreateBlogDto): Promise<string> {
    const blog = new this.BlogModel(dto);

    await this.blogsRepository.saveBlog(blog);
    return blog.id;
  }
}
