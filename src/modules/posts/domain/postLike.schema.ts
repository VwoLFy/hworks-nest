import { LikeStatus } from '../../../main/types/enums';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PostLike {
  @Prop({ default: Date.now })
  addedAt: Date;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  likeStatus: LikeStatus;

  updateLikeStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }
}
export type PostLikeDocument = HydratedDocument<PostLike>;

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
PostLikeSchema.loadClass(PostLike);
