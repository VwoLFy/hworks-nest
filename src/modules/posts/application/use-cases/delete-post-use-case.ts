import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class DeletePostCommand {
  constructor(public userId: string, public postId: string, public blogId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    const { userId, postId, blogId } = command;

    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException('post not found');

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (foundBlog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    await this.postsRepository.deletePost(postId);
    await this.commentsRepository.deleteAllCommentsOfPost(postId);
  }
}
