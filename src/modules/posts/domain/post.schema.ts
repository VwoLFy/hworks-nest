import mongoose, { HydratedDocument } from 'mongoose';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LikeStatus } from '../../../main/types/enums';
import { ObjectId } from 'mongodb';
import { PostLike, PostLikeDocument } from './postLike.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { CreatePostLikeDto } from '../application/dto/CreatePostLikeDto';

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  constructor() {
    this.likesCount = 0;
    this.dislikesCount = 0;
  }
}
export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

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

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true, type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;

  constructor(dto: CreatePostDto, blogName: string) {
    this._id = new ObjectId();
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
    this.extendedLikesInfo = new ExtendedLikesInfo();
  }

  updatePost(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  newLikeStatus(dto: CreatePostLikeDto): PostLike {
    const { userId, userLogin, likeStatus } = dto;
    return new PostLike({
      postId: this._id.toString(),
      userId,
      userLogin,
      likeStatus,
    });
  }

  updateLikeStatus(like: PostLikeDocument, likeStatus: LikeStatus): PostLikeDocument {
    like.updateLikeStatus(likeStatus);
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
