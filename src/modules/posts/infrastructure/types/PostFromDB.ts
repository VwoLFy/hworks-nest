import { LikeStatus } from '../../../../main/types/enums';

export class PostFromDB {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  isBanned: boolean;
  likesCount: number;
  dislikesCount: number;
  myStatus?: LikeStatus;
}
