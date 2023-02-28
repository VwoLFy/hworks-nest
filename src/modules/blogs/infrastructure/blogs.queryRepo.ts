import { FindBlogsQueryModel } from '../api/models/FindBlogsQueryModel';
import { BlogViewModel } from '../api/models/BlogViewModel';
import { Injectable } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { BlogViewModelSA } from '../api/models/BlogViewModelSA';
import { BlogFromDB } from './types/BlogFromDB';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogs(dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;
    let filterFind = `true`;
    let filterFindPar = [];

    if (searchNameTerm) {
      filterFind = `(LOWER("name") like LOWER($1))`;
      filterFindPar = [`%${searchNameTerm}%`];
    }
    const { count } = (
      await this.dataSource.query(
        `SELECT COUNT(*)
	          FROM public."Blogs" 
	          WHERE "isBanned" = false AND ${filterFind}`,
        filterFindPar,
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundBlogsFromDB: BlogFromDB[] = await this.dataSource.query(
      `SELECT *
	          FROM public."Blogs" 
	          WHERE "isBanned" = false AND ${filterFind}
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
      filterFindPar,
    );

    const items: BlogViewModel[] = foundBlogsFromDB.map((b) => new BlogViewModel(b));

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
    const blogFromDB: BlogFromDB = (
      await this.dataSource.query(`SELECT * FROM public."Blogs" WHERE id = $1 AND "isBanned" = false`, [blogId])
    )[0];
    if (!blogFromDB) return null;

    return new BlogViewModel(blogFromDB);
  }

  async findOwnBlogs(userId: string, dto: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;
    let filterFind = `true`;
    let filterFindPar = [];

    if (searchNameTerm) {
      filterFind = `(LOWER("name") like LOWER($2))`;
      filterFindPar = [`%${searchNameTerm}%`];
    }
    const { count } = (
      await this.dataSource.query(
        `SELECT COUNT(*)
	          FROM public."Blogs" 
	          WHERE "userId" = $1 AND ${filterFind}`,
        [userId, ...filterFindPar],
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundBlogsFromDB: BlogFromDB[] = await this.dataSource.query(
      `SELECT *
	          FROM public."Blogs" 
	          WHERE "userId" = $1 AND ${filterFind}
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, ...filterFindPar],
    );

    const items = foundBlogsFromDB.map((b) => new BlogViewModel(b));

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
    let filterFind = `true`;
    let filterFindPar = [];

    if (searchNameTerm) {
      filterFind = `(LOWER("name") like LOWER($1))`;
      filterFindPar = [`%${searchNameTerm}%`];
    }
    const { count } = (
      await this.dataSource.query(
        `SELECT COUNT(*)
	          FROM public."Blogs" 
	          WHERE ${filterFind}`,
        filterFindPar,
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundBlogsFromDB: BlogFromDB[] = await this.dataSource.query(
      `SELECT *
	          FROM public."Blogs" 
	          WHERE ${filterFind}
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
      filterFindPar,
    );

    const items: BlogViewModelSA[] = foundBlogsFromDB.map((b) => new BlogViewModelSA(b));

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
