import { LikeStatus } from '../../../../main/types/enums';
import { PostLikeDetailsViewModel } from './PostLikeDetailsViewModel';
import { ExtendedLikesInfo } from '../../domain/post.schema';

export class PostLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: PostLikeDetailsViewModel[];

  constructor(extendedLikesInfo: ExtendedLikesInfo, myStatus: LikeStatus, newestLikes: PostLikeDetailsViewModel[]) {
    this.likesCount = extendedLikesInfo.likesCount;
    this.dislikesCount = extendedLikesInfo.dislikesCount;
    this.myStatus = myStatus;
    this.newestLikes = newestLikes;
  }
}
