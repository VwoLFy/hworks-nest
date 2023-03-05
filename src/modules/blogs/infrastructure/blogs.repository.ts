import { Blog } from '../domain/blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog) private readonly blogsRepositoryT: Repository<Blog>) {}

  async findBlogById(blogId: string): Promise<Blog | null> {
    const foundBlog = await this.blogsRepositoryT.findOne({ where: { id: blogId } });
    return foundBlog ?? null;
  }

  async saveBlog(blog: Blog) {
    await this.blogsRepositoryT.save(blog);
  }

  async deleteBlog(blogId: string) {
    await this.blogsRepositoryT.delete({ id: blogId });
  }

  async deleteAll() {
    await this.blogsRepositoryT.delete({});
  }
}
