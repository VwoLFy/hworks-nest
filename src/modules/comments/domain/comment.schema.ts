import mongoose, { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../../../main/types/enums';
import { ObjectId } from 'mongodb';
import { CommentLike, CommentLikeDocument } from './commentLike.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { LikeCommentDto } from '../application/dto/LikeCommentDto';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, minlength: 3, maxlength: 30 })
  userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}
const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false })
export class LikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  constructor() {
    this.likesCount = 0;
    this.dislikesCount = 0;
  }
}
export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class Comment {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop({ required: true, minlength: 20, maxlength: 300 })
  content: string;

  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  @Prop({ required: true })
  isBanned: boolean;

  constructor(dto: CreateCommentDto, userLogin: string) {
    this._id = new ObjectId();
    this.content = dto.content;
    this.commentatorInfo = new CommentatorInfo(dto.userId, userLogin);
    this.postId = dto.postId;
    this.createdAt = new Date();
    this.likesInfo = new LikesInfo();
    this.isBanned = false;
  }

  setIsBanned(isBanned: boolean) {
    this.isBanned = isBanned;
  }

  newLikeStatus(dto: LikeCommentDto): CommentLike {
    return new CommentLike(dto);
  }

  updateLikeStatus(like: CommentLikeDocument, likeStatus: LikeStatus): CommentLikeDocument {
    like.updateLikeStatus(likeStatus);
    return like;
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
}

export type CommentDocument = HydratedDocument<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
