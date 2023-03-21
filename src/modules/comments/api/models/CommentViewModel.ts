import { CommentLikesInfoViewModel } from './CommentLikesInfoViewModel';
import { CommentatorInfoModel } from './CommentatorInfoModel';
import { CommentFromDB } from '../../infrastructure/dto/CommentFromDB';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesInfoViewModel;

  constructor(commentFromDB: CommentFromDB) {
    this.id = commentFromDB.id;
    this.content = commentFromDB.content;
    this.commentatorInfo = new CommentatorInfoModel(commentFromDB.userId, commentFromDB.userLogin);
    this.createdAt = commentFromDB.createdAt.toISOString();
    this.likesInfo = new CommentLikesInfoViewModel(
      commentFromDB.likesCount,
      commentFromDB.dislikesCount,
      commentFromDB.myStatus,
    );
  }
}
