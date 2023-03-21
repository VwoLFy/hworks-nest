import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikeCommentDto } from '../dto/LikeCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class LikeCommentCommand {
  constructor(public dto: LikeCommentDto) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand> {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: LikeCommentCommand) {
    const { commentId, userId, likeStatus } = command.dto;

    const foundCommentWithLike = await this.commentsRepository.findCommentWithLikeOfUser(commentId, userId);
    if (!foundCommentWithLike) throw new NotFoundException('comment not found');

    foundCommentWithLike.setLikeStatus(userId, likeStatus);
    await this.commentsRepository.saveComment(foundCommentWithLike);
  }
}
