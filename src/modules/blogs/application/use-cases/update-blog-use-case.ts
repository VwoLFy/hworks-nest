import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(public userId: string, public blogId: string, public dto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogId, userId, dto } = command;

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    blog.updateBlog(dto);
    await this.blogsRepository.saveBlog(blog);
    return true;
  }
}
