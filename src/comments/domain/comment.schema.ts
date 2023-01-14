import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../main/types/enums';
import { ObjectId } from 'mongodb';
import { CommentLikeDocument } from './commentLike.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Comment {
  _id: ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    default: {
      likesCount: 0,
      dislikesCount: 0,
    },
    type: { likesCount: Number, dislikesCount: Number },
  })
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };

  @Prop({ required: true, minlength: 20, maxlength: 300 })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, minlength: 3, maxlength: 30 })
  userLogin: string;

  @Prop({ required: true })
  postId: string;

  setLikeStatus(
    oldLike: CommentLikeDocument | null,
    userId: string,
    likeStatus: LikeStatus,
    CommentLikeModel: Model<CommentLikeDocument>,
  ): CommentLikeDocument {
    let oldLikeStatus: LikeStatus;
    let like: CommentLikeDocument;

    if (oldLike) {
      oldLikeStatus = oldLike.likeStatus;
      like = oldLike;
      like.updateLikeStatus(likeStatus);
    } else {
      oldLikeStatus = LikeStatus.None;
      like = new CommentLikeModel({
        commentId: this._id.toString(),
        userId,
        likeStatus,
      });
    }

    this.updateLikesCount(likeStatus, oldLikeStatus);
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
