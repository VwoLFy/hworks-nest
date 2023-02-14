import { CommentatorInfoModel } from './CommentatorInfoModel';
import { PostInfoViewModel } from './PostInfoViewModel';
import { CommentDocument } from '../../domain/comment.schema';
import { PostDocument } from '../../../posts/domain/post.schema';

export class CommentViewModelBl {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  postInfo: PostInfoViewModel;

  constructor(comment: CommentDocument, post: PostDocument) {
    this.id = comment._id.toString();
    this.content = comment.content;
    this.commentatorInfo = comment.commentatorInfo;
    this.createdAt = comment.createdAt.toISOString();
    this.postInfo = new PostInfoViewModel(post);
  }
}
