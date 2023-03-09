import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger.blogs.service';

export class UpdateBlogCommand {
  constructor(public userId: string, public blogId: string, public dto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected bloggerBlogsService: BloggerBlogsService) {}

  async execute(command: UpdateBlogCommand) {
    const blog = await this.bloggerBlogsService.findOwnBlogById(command.userId, command.blogId);

    blog.updateBlog(command.dto);
    await this.blogsRepository.saveBlog(blog);
  }
}
