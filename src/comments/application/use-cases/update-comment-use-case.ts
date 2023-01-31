import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../dto/UpdateCommentDto';

@Injectable()
export class UpdateCommentUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(dto: UpdateCommentDto) {
    const { commentId, content, userId } = dto;

    const foundComment = await this.commentsRepository.findCommentOrThrowError(commentId);
    if (foundComment.commentatorInfo.userId !== userId) throw new ForbiddenException();

    foundComment.updateComment(content);
    await this.commentsRepository.saveComment(foundComment);
  }
}
