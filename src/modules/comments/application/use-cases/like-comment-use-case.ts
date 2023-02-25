import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikeCommentDto } from '../dto/LikeCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Comment } from '../../domain/comment.schema';

export class LikeCommentCommand {
  constructor(public dto: LikeCommentDto) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand> {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: LikeCommentCommand) {
    const foundComment = await this.commentsRepository.findCommentOrThrowError(command.dto.commentId);

    await this.setLikeStatus(command.dto, foundComment);
  }

  async setLikeStatus(dto: LikeCommentDto, foundComment: Comment) {
    const { commentId, userId, likeStatus } = dto;

    const oldLike = await this.commentsRepository.findCommentLike(commentId, userId);

    const newLike = foundComment.setLikeStatus(oldLike, userId, likeStatus);

    await this.commentsRepository.updateCommentLikesCount(foundComment);
    if (oldLike) {
      await this.commentsRepository.updateCommentLike(newLike);
    } else {
      await this.commentsRepository.saveCommentLike(newLike);
    }
  }
}
