import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsService } from '../blogger.blogs.service';

export class DeletePostCommand {
  constructor(public userId: string, public postId: string, public blogId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected bloggerBlogsService: BloggerBlogsService) {}

  async execute(command: DeletePostCommand) {
    const { userId, postId, blogId } = command;

    await this.bloggerBlogsService.findOwnBlogById(userId, blogId);

    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException('post not found');

    await this.postsRepository.deletePost(postId);
  }
}
