import mongoose, { HydratedDocument } from 'mongoose';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';

@Schema({ _id: false })
export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}
const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

@Schema({ _id: false })
export class BanBlogInfo {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop()
  banDate: Date;
  constructor() {
    this.isBanned = false;
    this.banDate = null;
  }
}
const BanBlogInfoSchema = SchemaFactory.createForClass(BanBlogInfo);

@Schema()
export class Blog {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop({ required: true, maxlength: 15 })
  name: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({
    required: true,
    maxlength: 100,
    validate: (val: string) => val.match('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
  })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({ required: true, type: BlogOwnerInfoSchema })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ required: true, type: BanBlogInfoSchema })
  banBlogInfo: BanBlogInfo;

  constructor(dto: CreateBlogDto, userId: string, userLogin: string) {
    this._id = new ObjectId();
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.createdAt = new Date();
    this.isMembership = false;
    this.blogOwnerInfo = new BlogOwnerInfo(userId, userLogin);
    this.banBlogInfo = new BanBlogInfo();
  }

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  setBan(isBanned: boolean) {
    this.banBlogInfo.isBanned = isBanned;

    if (isBanned) {
      this.banBlogInfo.banDate = new Date();
    } else {
      this.banBlogInfo.banDate = null;
    }
  }
}

export type BlogDocument = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
