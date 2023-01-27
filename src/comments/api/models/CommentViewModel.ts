import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { CommentatorInfoModel } from './CommentatorInfoModel';

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesInfoViewModel;
};
