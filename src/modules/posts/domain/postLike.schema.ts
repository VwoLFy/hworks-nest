import { LikeStatus } from '../../../main/types/enums';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostLikeDto } from '../application/dto/CreatePostLikeDto';

@Schema()
export class PostLike {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  likeStatus: LikeStatus;

  @Prop({ required: true })
  private isAllowed: boolean;

  constructor(dto: CreatePostLikeDto) {
    this.postId = dto.postId;
    this.userId = dto.userId;
    this.login = dto.userLogin;
    this.likeStatus = dto.likeStatus;
    this.addedAt = new Date();
    this.isAllowed = true;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }

  set setIsAllowed(isAllowed: boolean) {
    this.isAllowed = isAllowed;
  }
}
export type PostLikeDocument = HydratedDocument<PostLike>;

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
PostLikeSchema.loadClass(PostLike);
