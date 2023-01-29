import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DeleteBlogUseCase {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(_id: string): Promise<boolean> {
    const isDeletedBlog = await this.blogsRepository.deleteBlog(_id);
    if (!isDeletedBlog) return false;

    await this.postsRepository.deleteAllPostsOfBlog(_id);
    return true;
  }
}
