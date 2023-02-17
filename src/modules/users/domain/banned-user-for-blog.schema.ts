import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class BannedUserForBlog {
  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true, min: 20 })
  banReason: string;

  @Prop({ required: true })
  banDate: Date;

  constructor(blogId: string, userId: string, userLogin: string, banReason: string) {
    this.blogId = blogId;
    this.userId = userId;
    this.userLogin = userLogin;
    this.banReason = banReason;
    this.banDate = new Date();
  }
}
export type BannedUserForBlogDocument = HydratedDocument<BannedUserForBlog>;

export const BannedUserForBlogSchema = SchemaFactory.createForClass(BannedUserForBlog);
BannedUserForBlogSchema.loadClass(BannedUserForBlog);
