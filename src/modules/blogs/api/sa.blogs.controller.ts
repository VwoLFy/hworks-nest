import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { Body, Controller, Get, HttpCode, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { BlogViewModelSA } from './models/BlogViewModelSA';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../application/use-cases/bind-blog-with-user-use-case';
import { BanBlogDto } from '../application/dto/BanBlogDto';
import { BanBlogCommand } from '../application/use-cases/ban-blog-use-case';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsControllerSA {
  constructor(protected blogsQueryRepo: BlogsQueryRepo, private commandBus: CommandBus) {}

  @Get()
  async findBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModelSA>> {
    return await this.blogsQueryRepo.findBlogsSA(query);
  }

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('blogId', checkObjectIdPipe) blogId: string,
    @Param('userId', checkObjectIdPipe) userId: string,
  ) {
    await this.commandBus.execute(new BindBlogWithUserCommand(userId, blogId));
  }

  @Put(':blogId/ban')
  @HttpCode(204)
  async banBlog(@Param('blogId', checkObjectIdPipe) blogId: string, @Body() body: BanBlogDto) {
    await this.commandBus.execute(new BanBlogCommand(blogId, body.isBanned));
  }
}
