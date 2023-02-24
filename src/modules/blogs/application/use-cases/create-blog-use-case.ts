import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class CreateBlogCommand {
  constructor(public userId: string, public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected usersRepository: UsersRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    return await this.createBlogDocument(command);
  }

  async createBlogDocument(command): Promise<string> {
    const { userId, dto } = command;

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    const blog = new Blog(dto, userId, userLogin);
    await this.blogsRepository.saveBlog(blog);

    return blog.id;
  }
}
