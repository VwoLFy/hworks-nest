import { Blog, BlogDocument } from '../domain/blog.schema';
import { FindBlogsQueryModel } from '../api/models/FindBlogsQueryModel';
import { BlogViewModel } from '../api/models/BlogViewModel';
import { BlogsViewModelPage } from '../api/models/BlogsViewModelPage';
import { SortDirection } from '../../main/types/enums';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findBlogs(dto: FindBlogsQueryModel): Promise<BlogsViewModelPage> {
    let { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    sortBy = sortBy === 'id' ? '_id' : sortBy;
    const optionsSort: { [key: string]: SortDirection } = {
      [sortBy]: sortDirection,
    };

    const totalCount = await this.BlogModel.countDocuments()
      .where('name')
      .regex(new RegExp(searchNameTerm, 'i'));
    const pagesCount = Math.ceil(totalCount / pageSize);

    const items: BlogViewModel[] = (
      await this.BlogModel.find()
        .where('name')
        .regex(new RegExp(searchNameTerm, 'i'))
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort(optionsSort)
        .lean()
    ).map((b) => this.blogWithReplaceId(b));

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
  async findBlogById(_id: string): Promise<BlogViewModel | null> {
    const foundBlog = await this.BlogModel.findById(_id);

    if (!foundBlog) return null;

    return this.blogWithReplaceId(foundBlog);
  }
  blogWithReplaceId(object: Blog): BlogViewModel {
    return {
      id: object._id.toString(),
      name: object.name,
      description: object.description,
      websiteUrl: object.websiteUrl,
      createdAt: object.createdAt,
    };
  }
}
