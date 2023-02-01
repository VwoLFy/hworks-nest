import { LikeStatus } from '../../../../main/types/enums';
import { IsEnum } from 'class-validator';

export class PostLikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
