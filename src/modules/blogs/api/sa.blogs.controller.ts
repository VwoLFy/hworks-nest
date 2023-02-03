import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { Controller, Get, Query } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { BlogViewModel } from './models/BlogViewModel';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(protected blogsQueryRepo: BlogsQueryRepo) {}

  @Get()
  async findBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    return await this.blogsQueryRepo.findBlogsPublic(query);
  }
}
