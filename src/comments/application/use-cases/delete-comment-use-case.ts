import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';

@Injectable()
export class DeleteCommentUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(commentId: string, userId: string): Promise<number> {
    const foundComment = await this.commentsRepository.findComment(commentId);
    if (!foundComment) {
      return 404;
    } else if (foundComment.commentatorInfo.userId !== userId) {
      return 403;
    }
    return await this.commentsRepository.deleteComment(foundComment._id);
  }
}
