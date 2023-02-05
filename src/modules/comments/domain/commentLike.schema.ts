import { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../../../main/types/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CommentLike {
  @Prop({ default: Date.now })
  addedAt: Date;

  @Prop({ required: true })
  public commentId: string;

  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public likeStatus: LikeStatus;

  @Prop({ default: true })
  private isAllowed: boolean;

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }

  set setIsAllowed(isAllowed: boolean) {
    this.isAllowed = isAllowed;
  }
}

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);
