import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(public _id: string, public dto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(command._id);
    if (!blog) return false;

    blog.updateBlog(command.dto);
    await this.blogsRepository.saveBlog(blog);
    return true;
  }
}
