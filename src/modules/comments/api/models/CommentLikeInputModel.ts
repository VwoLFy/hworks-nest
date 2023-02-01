import { LikeStatus } from '../../../../main/types/enums';
import { IsEnum } from 'class-validator';

export class CommentLikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
