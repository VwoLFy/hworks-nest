import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command;

    const foundComment = await this.commentsRepository.findCommentOrThrowError(commentId);
    if (foundComment.commentatorInfo.userId !== userId) throw new ForbiddenException();

    await this.commentsRepository.deleteComment(foundComment._id);
  }
}
