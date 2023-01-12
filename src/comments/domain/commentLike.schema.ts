import { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../../main/types/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CommentLike {
  @Prop({ default: new Date() })
  addedAt: Date;

  @Prop({ required: true })
  public commentId: string;

  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public likeStatus: LikeStatus;

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }
}

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);
