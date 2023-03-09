import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { CommandBus } from '@nestjs/cqrs';
import { UserId } from '../../../main/decorators/user.decorator';
import { findBannedUsersForBlogQueryPipe } from './models/FindBannedUsersForBlogQueryPipe';
import { FindBannedUsersForBlogQueryModel } from './models/FindBannedUsersForBlogQueryModel';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { BannedUserForBlogViewModel } from './models/BannedUserForBlogViewModel';
import { BanUserForBlogDto } from '../application/dto/BanUserForBlogDto';
import { BanUserForBlogByBloggerCommand } from '../application/use-cases/ban-user-for-blog-by-blogger-use-case';
import { BloggerUsersQueryRepo } from '../infrastructure/blogger.users.queryRepo';

@Controller('blogger/users')
@UseGuards(JwtAuthGuard)
export class BloggerUsersController {
  constructor(
    protected bannedUsersForBlogQueryRepo: BloggerUsersQueryRepo,
    protected blogsRepository: BlogsRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('blog/:blogId')
  async findBannedUsersForBlog(
    @UserId() bloggerId: string,
    @Query(findBannedUsersForBlogQueryPipe) query: FindBannedUsersForBlogQueryModel,
    @Param('blogId', ParseUUIDPipe) blogId: string,
  ): Promise<PageViewModel<BannedUserForBlogViewModel>> {
    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (foundBlog.userId !== bloggerId) throw new ForbiddenException();

    return await this.bannedUsersForBlogQueryRepo.findBannedUsersForBlog(blogId, query);
  }

  @Put(':bannedUserId/ban')
  @HttpCode(204)
  async banUserForBlog(
    @UserId() bloggerId: string,
    @Param('bannedUserId', ParseUUIDPipe) bannedUserId: string,
    @Body() body: BanUserForBlogDto,
  ) {
    await this.commandBus.execute(new BanUserForBlogByBloggerCommand(bloggerId, bannedUserId, body));
  }
}
