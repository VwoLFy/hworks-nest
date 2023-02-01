import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LikeStatus } from '../../../main/types/enums';
import { ObjectId } from 'mongodb';
import { PostLikeDocument } from './postLike.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Post {
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
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
  };

  @Prop({ required: true, maxlength: 30 })
  title: string;

  @Prop({ required: true, maxlength: 100 })
  shortDescription: string;

  @Prop({ required: true, maxlength: 1000 })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true, maxlength: 15 })
  blogName: string;

  updatePost(dto: UpdatePostDto, blogName: string) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = blogName;
  }

  setLikeStatus(
    oldLike: PostLikeDocument | null,
    userId: string,
    login: string,
    likeStatus: LikeStatus,
    PostLikeModel: Model<PostLikeDocument>,
  ) {
    let oldLikeStatus: LikeStatus;
    let like: PostLikeDocument;

    if (oldLike) {
      oldLikeStatus = oldLike.likeStatus;
      like = oldLike;
      like.updateLikeStatus(likeStatus);
    } else {
      oldLikeStatus = LikeStatus.None;
      like = new PostLikeModel({
        postId: this._id.toString(),
        userId,
        login,
        likeStatus,
      });
    }

    this.updateLikesCount(likeStatus, oldLikeStatus);
    return like;
  }

  updateLikesCount(likeStatus: LikeStatus, oldLikeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like && oldLikeStatus !== LikeStatus.Like) {
      this.extendedLikesInfo.likesCount += 1;
    } else if (likeStatus === LikeStatus.Dislike && oldLikeStatus !== LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount += 1;
    }
    if (likeStatus !== LikeStatus.Like && oldLikeStatus === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount -= 1;
    } else if (likeStatus !== LikeStatus.Dislike && oldLikeStatus === LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount -= 1;
    }
  }
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
