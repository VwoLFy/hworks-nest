import { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../../../main/types/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeCommentDto } from '../application/dto/LikeCommentDto';

@Schema()
export class CommentLike {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  public commentId: string;

  @Prop({ required: true })
  public userId: string;

  @Prop({ required: true })
  public likeStatus: LikeStatus;

  @Prop({ required: true })
  private isBanned: boolean;

  constructor(dto: LikeCommentDto) {
    this.commentId = dto.commentId;
    this.userId = dto.userId;
    this.likeStatus = dto.likeStatus;
    this.addedAt = new Date();
    this.isBanned = false;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }

  set setIsBanned(isBanned: boolean) {
    this.isBanned = isBanned;
  }
}

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);
