import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger.blogs.service';

export class DeleteBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected bloggerBlogsService: BloggerBlogsService) {}

  async execute(command: DeleteBlogCommand) {
    const blog = await this.bloggerBlogsService.findOwnBlogById(command.userId, command.blogId);
    await this.blogsRepository.deleteBlog(blog.id);
  }
}
