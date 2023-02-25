import { Model } from 'mongoose';
import { LikeStatus } from '../../../main/types/enums';
import { CommentLike, CommentLikeDocument } from './commentLike.schema';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { randomUUID } from 'crypto';
import { CommentFromDB } from '../infrastructure/dto/CommentFromDB';

export class CommentatorInfo {
  userId: string;
  userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;

  constructor() {
    this.likesCount = 0;
    this.dislikesCount = 0;
  }
}

export class Comment {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  postId: string;
  createdAt: Date;
  likesInfo: LikesInfo;
  isBanned: boolean;

  constructor(dto: CreateCommentDto, userLogin: string) {
    this.id = randomUUID();
    this.content = dto.content;
    this.commentatorInfo = new CommentatorInfo(dto.userId, userLogin);
    this.postId = dto.postId;
    this.createdAt = new Date();
    this.likesInfo = new LikesInfo();
    this.isBanned = false;
  }

  setLikeStatus(
    CommentLikeModel: Model<CommentLikeDocument>,
    like: CommentLikeDocument | null,
    userId: string,
    likeStatus: LikeStatus,
  ): CommentLikeDocument {
    if (!like) like = this.createLikeStatus(CommentLikeModel, userId);

    const oldLikeStatus = like.likeStatus;
    like.updateLikeStatus(likeStatus);

    this.updateLikesCount(likeStatus, oldLikeStatus);

    return like;
  }

  createLikeStatus(CommentLikeModel: Model<CommentLikeDocument>, userId: string): CommentLikeDocument {
    const like = new CommentLike(this.id, userId);
    return new CommentLikeModel(like);
  }

  updateLikesCount(likeStatus: LikeStatus, oldLikeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like && oldLikeStatus !== LikeStatus.Like) {
      this.likesInfo.likesCount += 1;
    } else if (likeStatus === LikeStatus.Dislike && oldLikeStatus !== LikeStatus.Dislike) {
      this.likesInfo.dislikesCount += 1;
    }
    if (likeStatus !== LikeStatus.Like && oldLikeStatus === LikeStatus.Like) {
      this.likesInfo.likesCount -= 1;
    } else if (likeStatus !== LikeStatus.Dislike && oldLikeStatus === LikeStatus.Dislike) {
      this.likesInfo.dislikesCount -= 1;
    }
  }
  updateComment(content: string) {
    this.content = content;
  }

  static createCommentFromDB(commentFromDB: CommentFromDB): Comment {
    const comment = new Comment(commentFromDB, commentFromDB.userLogin);
    comment.id = commentFromDB.id;
    comment.createdAt = commentFromDB.createdAt;
    comment.isBanned = commentFromDB.isBanned;
    comment.likesInfo.likesCount = commentFromDB.likesCount;
    comment.likesInfo.dislikesCount = commentFromDB.dislikesCount;
    return comment;
  }
}
