import { CommentatorInfoModel } from './CommentatorInfoModel';
import { PostInfoViewModel } from './PostInfoViewModel';
import { CommentDocument } from '../../domain/comment.schema';
import { PostDocument } from '../../../posts/domain/post.schema';
import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { LikeStatus } from '../../../../main/types/enums';

export class CommentViewModelBl {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  postInfo: PostInfoViewModel;
  likesInfo: CommentLikesInfoViewModel;

  constructor(comment: CommentDocument, post: PostDocument, myStatus: LikeStatus) {
    this.id = comment._id.toString();
    this.content = comment.content;
    this.commentatorInfo = comment.commentatorInfo;
    this.createdAt = comment.createdAt.toISOString();
    this.postInfo = new PostInfoViewModel(post);
    this.likesInfo = new CommentLikesInfoViewModel(comment.likesInfo, myStatus);
  }
}
