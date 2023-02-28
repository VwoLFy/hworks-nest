import { LikeStatus } from '../../../../main/types/enums';

export class CommentLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;

  constructor(likesCount: number, dislikesCount: number, myStatus: LikeStatus) {
    this.likesCount = likesCount;
    this.dislikesCount = dislikesCount;
    this.myStatus = myStatus;
  }
}
