import { LikeStatus } from '../../../main/types/enums';
import { CommentLikeFromDB } from '../infrastructure/dto/CommentLikeFromDB';

export class CommentLike {
  public addedAt: Date;
  public commentId: string;
  public userId: string;
  public likeStatus: LikeStatus;
  public isBanned: boolean;

  constructor(commentId: string, userId: string) {
    this.commentId = commentId;
    this.userId = userId;
    this.likeStatus = LikeStatus.None;
    this.addedAt = new Date();
    this.isBanned = false;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }

  static createCommentLike(commentLikeFromDB: CommentLikeFromDB): CommentLike {
    const like = new CommentLike(commentLikeFromDB.commentId, commentLikeFromDB.userId);
    like.addedAt = commentLikeFromDB.addedAt;
    like.likeStatus = commentLikeFromDB.likeStatus;
    like.isBanned = commentLikeFromDB.isBanned;

    return like;
  }
}
