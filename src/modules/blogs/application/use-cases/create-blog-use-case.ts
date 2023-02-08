import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class CreateBlogCommand {
  constructor(public userId: string, public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = await this.createBlogDocument(command);
    return blog.id;
  }

  async createBlogDocument(command): Promise<BlogDocument> {
    const { userId, dto } = command;

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    const blog = new Blog(dto, userId, userLogin);
    const blogModel = new this.BlogModel(blog);
    await this.blogsRepository.saveBlog(blogModel);

    return blogModel;
  }
}
