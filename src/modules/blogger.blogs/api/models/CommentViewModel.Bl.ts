import { CommentatorInfoModel } from '../../../comments/api/models/CommentatorInfoModel';
import { PostInfoViewModel } from './PostInfoViewModel';
import { CommentLikesInfoViewModel } from '../../../comments/api/models/CommentLikesInfoViewModel';
import { LikeStatus } from '../../../../main/types/enums';
import { CommentFromDB } from '../../../comments/infrastructure/dto/CommentFromDB';
import { PostFromDB } from '../../../posts/infrastructure/types/PostFromDB';

export class CommentViewModelBl {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  postInfo: PostInfoViewModel;
  likesInfo: CommentLikesInfoViewModel;

  constructor(commentFromDB: CommentFromDB, postFromDB: PostFromDB, myStatus: LikeStatus) {
    this.id = commentFromDB.id;
    this.content = commentFromDB.content;
    this.commentatorInfo = new CommentatorInfoModel(commentFromDB.userId, commentFromDB.userLogin);
    this.createdAt = commentFromDB.createdAt.toISOString();
    this.postInfo = new PostInfoViewModel(postFromDB);
    this.likesInfo = new CommentLikesInfoViewModel(commentFromDB.likesCount, commentFromDB.dislikesCount, myStatus);
  }
}
