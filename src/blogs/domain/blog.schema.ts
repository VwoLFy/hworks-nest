import { HydratedDocument } from 'mongoose';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Blog {
  _id: ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

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

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export type BlogDocument = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
