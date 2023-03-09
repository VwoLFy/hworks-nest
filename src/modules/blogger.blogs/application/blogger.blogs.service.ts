import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { Blog } from '../../blogs/domain/blog.entity';

@Injectable()
export class BloggerBlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async findOwnBlogById(userId: string, blogId: string): Promise<Blog> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (blog.userId !== userId) throw new ForbiddenException();
    return blog;
  }
}
