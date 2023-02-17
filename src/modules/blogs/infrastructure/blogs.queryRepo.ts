import { Blog, BlogDocument } from '../domain/blog.schema';
import { FindBlogsQueryModel } from '../api/models/FindBlogsQueryModel';
import { BlogViewModel } from '../api/models/BlogViewModel';
import { SortDirection } from '../../../main/types/enums';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { BlogViewModelSA } from '../api/models/BlogViewModelSA';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async findBlogs(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize } = dto;

    const totalCount = await this.BlogModel.countDocuments()
      .where('name')
      .regex(new RegExp(searchNameTerm, 'i'))
      .where('banBlogInfo.isBanned', false);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundBlogs = await this.findBlogsFromDb(null, dto, false);

    const items: BlogViewModel[] = foundBlogs.map((b) => new BlogViewModel(b));

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  async findBlogById(blogId: string): Promise<BlogViewModel | null> {
    const foundBlog = await this.BlogModel.findOne({ _id: blogId, 'banBlogInfo.isBanned': false });
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

    const foundBlogs = await this.findBlogsFromDb(userId, dto, true);

    const items = foundBlogs.map((b) => new BlogViewModel(b));

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  async findBlogsSA(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModelSA>> {
    const { searchNameTerm, pageNumber, pageSize } = dto;

    const totalCount = await this.BlogModel.countDocuments().where('name').regex(new RegExp(searchNameTerm, 'i'));
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundBlogs = await this.findBlogsFromDb(null, dto, true);

    const items: BlogViewModelSA[] = foundBlogs.map((b) => new BlogViewModelSA(b));

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  private async findBlogsFromDb(
    userId: string,
    dto: FindBlogsQueryModel,
    findBanned: boolean,
  ): Promise<BlogDocument[]> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const optionsSort: { [key: string]: SortDirection } = { [sortBy]: sortDirection };

    let foundBlogs = this.BlogModel.find()
      .where('name')
      .regex(new RegExp(searchNameTerm, 'i'))
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(optionsSort);

    foundBlogs = findBanned ? foundBlogs : foundBlogs.where('banBlogInfo.isBanned', false);
    foundBlogs = !userId ? foundBlogs : foundBlogs.where('blogOwnerInfo.userId', userId);
    return foundBlogs;
  }
}
