import { LikeStatus } from '../../../../main/types/enums';

export class CreatePostLikeDto {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}
