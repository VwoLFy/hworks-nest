import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class BannedUserForBlog {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true, min: 20 })
  banReason: string;

  @Prop({ required: true })
  banDate: Date;

  @Prop({ required: true })
  blogId: string;

  constructor(blogId: string, userId: string, userLogin: string, banReason: string) {
    this.blogId = blogId;
    this.id = userId;
    this.login = userLogin;
    this.banReason = banReason;
    this.banDate = new Date();
  }
}
export type BannedUserForBlogDocument = HydratedDocument<BannedUserForBlog>;

export const BannedUserForBlogSchema = SchemaFactory.createForClass(BannedUserForBlog);
BannedUserForBlogSchema.loadClass(BannedUserForBlog);
