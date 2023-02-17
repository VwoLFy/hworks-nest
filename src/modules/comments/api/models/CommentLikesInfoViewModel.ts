import { LikeStatus } from '../../../../main/types/enums';
import { LikesInfo } from '../../domain/comment.schema';

export class CommentLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;

  constructor(dto: LikesInfo, myStatus: LikeStatus) {
    this.likesCount = dto.likesCount;
    this.dislikesCount = dto.dislikesCount;
    this.myStatus = myStatus;
  }
}
