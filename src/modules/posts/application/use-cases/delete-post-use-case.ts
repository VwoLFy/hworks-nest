import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public _id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected commentsRepository: CommentsRepository) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    const isDeletedPost = await this.postsRepository.deletePost(command._id);
    if (!isDeletedPost) return false;

    await this.commentsRepository.deleteAllCommentsOfPost(command._id);
    return true;
  }
}
