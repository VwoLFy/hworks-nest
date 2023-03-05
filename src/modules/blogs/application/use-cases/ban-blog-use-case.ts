import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class BanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected postsRepository: PostsRepository) {}

  async execute(command: BanBlogCommand) {
    const { isBanned, blogId } = command;

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');

    foundBlog.setBan(isBanned);

    await this.postsRepository.updateBanOnPostsOfBlog(foundBlog.id, isBanned);

    await this.blogsRepository.saveBlog(foundBlog);
  }
}
