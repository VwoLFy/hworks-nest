import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = new this.BlogModel(command.dto);

    await this.blogsRepository.saveBlog(blog);
    return blog.id;
  }
}
