import { CommentatorInfoModel } from './CommentatorInfoModel';
import { PostInfoViewModel } from './PostInfoViewModel';
import { Comment } from '../../domain/comment.schema';
import { Post } from '../../../posts/domain/post.schema';
import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { LikeStatus } from '../../../../main/types/enums';

export class CommentViewModelBl {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  postInfo: PostInfoViewModel;
  likesInfo: CommentLikesInfoViewModel;

  constructor(comment: Comment, post: Post, myStatus: LikeStatus) {
    this.id = comment.id;
    this.content = comment.content;
    this.commentatorInfo = comment.commentatorInfo;
    this.createdAt = comment.createdAt.toISOString();
    this.postInfo = new PostInfoViewModel(post);
    this.likesInfo = new CommentLikesInfoViewModel(comment.likesInfo, myStatus);
  }
}
