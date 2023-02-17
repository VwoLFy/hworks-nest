import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { CommentatorInfoModel } from './CommentatorInfoModel';
import { CommentDocument } from '../../domain/comment.schema';
import { LikeStatus } from '../../../../main/types/enums';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesInfoViewModel;

  constructor(comment: CommentDocument, myStatus: LikeStatus) {
    this.id = comment._id.toString();
    this.content = comment.content;
    this.commentatorInfo = comment.commentatorInfo;
    this.createdAt = comment.createdAt.toISOString();
    this.likesInfo = new CommentLikesInfoViewModel(comment.likesInfo, myStatus);
  }
}
