import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../dto/UpdateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentCommand {
  constructor(public dto: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, content, userId } = command.dto;

    const foundComment = await this.commentsRepository.findCommentOrThrowError(commentId);
    if (foundComment.commentatorInfo.userId !== userId) throw new ForbiddenException();

    foundComment.updateComment(content);
    await this.commentsRepository.saveComment(foundComment);
  }
}
