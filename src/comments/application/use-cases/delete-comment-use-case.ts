import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';

@Injectable()
export class DeleteCommentUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(commentId: string, userId: string) {
    const foundComment = await this.commentsRepository.findCommentOrThrowError(commentId);
    if (foundComment.commentatorInfo.userId !== userId) throw new ForbiddenException();

    await this.commentsRepository.deleteComment(foundComment._id);
  }
}
