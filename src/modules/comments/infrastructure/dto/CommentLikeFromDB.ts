import { LikeStatus } from '../../../../main/types/enums';

export class CommentLikeFromDB {
  public addedAt: Date;
  public commentId: string;
  public userId: string;
  public likeStatus: LikeStatus;
  public isBanned: boolean;
}