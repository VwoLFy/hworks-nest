import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { CommentatorInfoModel } from './CommentatorInfoModel';
import { Comment } from '../../domain/comment.schema';
import { LikeStatus } from '../../../../main/types/enums';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesInfoViewModel;

  constructor(comment: Comment, myStatus: LikeStatus) {
    this.id = comment.id;
    this.content = comment.content;
    this.commentatorInfo = comment.commentatorInfo;
    this.createdAt = comment.createdAt.toISOString();
    this.likesInfo = new CommentLikesInfoViewModel(comment.likesInfo, myStatus);
  }
}
