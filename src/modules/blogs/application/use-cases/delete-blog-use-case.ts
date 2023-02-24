import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    const { userId, blogId } = command;

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    await this.blogsRepository.deleteBlog(blogId);
  }
}
