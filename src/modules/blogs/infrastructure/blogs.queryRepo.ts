import { Blog, BlogDocument } from '../domain/blog.schema';
import { FindBlogsQueryModel } from '../api/models/FindBlogsQueryModel';
import { BlogViewModel } from '../api/models/BlogViewModel';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { SortDirection } from '../../../main/types/enums';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationPageModel } from '../api/models/PaginationPageModel';
import { BlogViewModelSA } from '../api/models/BlogViewModelSA';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  private async findBlogsFromDb(userId: string, dto: FindBlogsQueryModel): Promise<BlogDocument[]> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const optionsSort: { [key: string]: SortDirection } = { [sortBy]: sortDirection };

    const foundBlogs = this.BlogModel.find()
      .where('name')
      .regex(new RegExp(searchNameTerm, 'i'))
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(optionsSort);
    return !userId ? foundBlogs : foundBlogs.where('blogOwnerInfo.userId', userId);
  }

  async findBlogById(_id: string): Promise<BlogViewModel | null> {
    const foundBlog = await this.BlogModel.findById(_id);
    if (!foundBlog) return null;

    return new BlogViewModel(foundBlog);
  }

  async findOwnBlogs(userId: string, dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize } = dto;

    const totalCount = await this.BlogModel.countDocuments()
      .where('name')
      .regex(new RegExp(searchNameTerm, 'i'))
      .where('blogOwnerInfo.userId', userId);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundBlogs = await this.findBlogsFromDb(userId, dto);

    const items = foundBlogs.map((b) => new BlogViewModel(b));

    const paginationPage = new PaginationPageModel({
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
    });
    return { ...paginationPage, items };
  }

  async findBlogs(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize } = dto;

    const totalCount = await this.BlogModel.countDocuments().where('name').regex(new RegExp(searchNameTerm, 'i'));
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundBlogs = await this.findBlogsFromDb(null, dto);

    const items: BlogViewModel[] = foundBlogs.map((b) => new BlogViewModel(b));

    const paginationPage = new PaginationPageModel({
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
    });
    return { ...paginationPage, items };
  }

  async findBlogsSA(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModelSA>> {
    const { searchNameTerm, pageNumber, pageSize } = dto;

    const totalCount = await this.BlogModel.countDocuments().where('name').regex(new RegExp(searchNameTerm, 'i'));
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundBlogs = await this.findBlogsFromDb(null, dto);

    const items: BlogViewModelSA[] = foundBlogs.map((b) => new BlogViewModelSA(b));

    const paginationPage = new PaginationPageModel({
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
    });
    return { ...paginationPage, items };
  }
}
