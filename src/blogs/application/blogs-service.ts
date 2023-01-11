import { BlogsRepository } from '../infrastructure/blogs-repository';
//import { PostsRepository } from '../../posts/infrastructure/posts-repository';
import { UpdateBlogDto } from './dto/UpdateBlogDto';
import { Blog, BlogDocument } from '../domain/blog.schema';
import { CreateBlogDto } from './dto/CreateBlogDto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    //protected postsRepository: PostsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = new this.BlogModel(dto);

    await this.blogsRepository.saveBlog(blog);
    return blog.id;
  }
  async updateBlog(_id: string, dto: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(_id);
    if (!blog) return false;

    blog.updateBlog(dto);
    await this.blogsRepository.saveBlog(blog);
    return true;
  }
  async deleteBlog(_id: string): Promise<boolean> {
    const isDeletedBlog = await this.blogsRepository.deleteBlog(_id);
    if (!isDeletedBlog) return false;

    //await this.postsRepository.deleteAllPostsOfBlog(id);
    return true;
  }
  async deleteAll() {
    await this.blogsRepository.deleteAll();
  }
}
