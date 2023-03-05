import { FindBlogsQueryModel } from '../api/models/FindBlogsQueryModel';
import { BlogViewModel } from '../api/models/BlogViewModel';
import { Injectable } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { BlogViewModelSA } from '../api/models/BlogViewModelSA';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectRepository(Blog) private readonly blogsRepositoryT: Repository<Blog>) {}

  async findBlogs(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const [foundBlog, totalCount] = await this.blogsRepositoryT.findAndCount({
      where: { name: ILike(`%${searchNameTerm}%`), isBanned: false },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);
    const items: BlogViewModel[] = foundBlog.map((b) => new BlogViewModel(b));

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
    const foundBlog = await this.blogsRepositoryT.findOne({ where: { id: blogId, isBanned: false } });
    if (!foundBlog) return null;

    return new BlogViewModel(foundBlog);
  }

  async findOwnBlogs(userId: string, dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const [foundBlog, totalCount] = await this.blogsRepositoryT.findAndCount({
      where: { name: ILike(`%${searchNameTerm}%`), userId: userId },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);
    const items = foundBlog.map((b) => new BlogViewModel(b));

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
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const [foundBlog, totalCount] = await this.blogsRepositoryT.findAndCount({
      where: { name: ILike(`%${searchNameTerm}%`) },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);
    const items: BlogViewModelSA[] = foundBlog.map((b) => new BlogViewModelSA(b));

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
}
