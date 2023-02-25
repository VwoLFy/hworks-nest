import { LikeStatus } from '../../../../main/types/enums';

export class PostLikeFromDB {
  addedAt: Date;
  postId: string;
  userId: string;
  login: string;
  likeStatus: LikeStatus;
  isBanned: boolean;
}