import { LikeStatus } from '../../../../main/types/enums';
import { PostLikeDetailsViewModel } from './PostLikeDetailsViewModel';

export class PostLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: PostLikeDetailsViewModel[];

  constructor(
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: PostLikeDetailsViewModel[],
  ) {
    this.likesCount = likesCount;
    this.dislikesCount = dislikesCount;
    this.myStatus = myStatus;
    this.newestLikes = newestLikes;
  }
}
