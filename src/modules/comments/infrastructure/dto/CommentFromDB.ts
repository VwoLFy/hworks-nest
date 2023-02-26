import { LikeStatus } from '../../../../main/types/enums';

export class CommentFromDB {
  id: string;
  content: string;
  postId: string;
  createdAt: Date;
  isBanned: boolean;
  userId: string;
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
