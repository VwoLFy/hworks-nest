import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class BanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand) {
    const { isBanned, blogId } = command;

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');

    foundBlog.setBan(isBanned);

    await this.blogsRepository.saveBlog(foundBlog);
  }
}
