import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';

@Injectable()
export class UpdateBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(_id: string, dto: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(_id);
    if (!blog) return false;

    blog.updateBlog(dto);
    await this.blogsRepository.saveBlog(blog);
    return true;
  }
}
