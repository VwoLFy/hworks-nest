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
    //const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;
    const pageNumber = +dto.pageNumber || 1;
    const pageSize = +dto.pageSize || 10;
    const sortBy = dto.sortBy === 'id' ? '_id' : dto.sortBy || 'createdAt';
    const sortDirection = dto.sortDirection || SortDirection.desc;

    const sortByField = sortBy === 'id' ? '_id' : sortBy;
    const optionsSort: { [key: string]: SortDirection } = {
      [sortByField]: sortDirection,
    };

    const totalCount = await this.BlogModel.countDocuments()
      .where('name')
      .regex(new RegExp(dto.searchNameTerm, 'i'));
    const pagesCount = Math.ceil(totalCount / pageSize);

    const items: BlogViewModel[] = (
      await this.BlogModel.find()
        .where('name')
        .regex(new RegExp(dto.searchNameTerm, 'i'))
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
