import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { LikeStatus } from '../../../main/types/enums';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async banUserComments(userId: string, isBanned: boolean) {
    await this.commentsRepository.updateBanOnUserComments(userId, isBanned);
  }

  async banUserCommentLikes(userId: string, isBanned: boolean) {
    await this.commentsRepository.updateBanOnUserCommentsLikes(userId, isBanned);

    const foundCommentLikes = await this.commentsRepository.findUserCommentLikes(userId);

    for (const foundCommentLike of foundCommentLikes) {
      const foundComment = await this.commentsRepository.findCommentOrThrowError(foundCommentLike.commentId);
      if (isBanned) {
        foundComment.updateLikesCount(LikeStatus.None, foundCommentLike.likeStatus);
      } else {
        foundComment.updateLikesCount(foundCommentLike.likeStatus, LikeStatus.None);
      }

      await this.commentsRepository.saveComment(foundComment);
    }
  }
}
