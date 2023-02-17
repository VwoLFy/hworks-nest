import { Body, Controller, ForbiddenException, Get, HttpCode, Param, Put, Query, UseGuards } from '@nestjs/common';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { BanUserForBlogDto } from '../application/dto/BanUserForBlogDto';
import { FindBannedUsersForBlogQueryModel } from './models/FindBannedUsersForBlogQueryModel';
import { findBannedUsersForBlogQueryPipe } from './models/FindBannedUsersForBlogQueryPipe';
import { BanUserForBlogCommand } from '../application/use-cases/ban-user-for-blog-use-case';
import { UserId } from '../../../main/decorators/user.decorator';
import { BannedUserForBlogViewModel } from './models/BannedUserForBlogViewModel';
import { UsersQueryRepo } from '../infrastructure/users.queryRepo';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { PageViewModel } from '../../../main/types/PageViewModel';

@Controller('blogger/users')
@UseGuards(JwtAuthGuard)
export class UsersControllerBl {
  constructor(
    protected usersQueryRepo: UsersQueryRepo,
    protected blogsRepository: BlogsRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('blog/:blogId')
  async findBannedUsersForBlog(
    @UserId() userId: string,
    @Query(findBannedUsersForBlogQueryPipe) query: FindBannedUsersForBlogQueryModel,
    @Param('blogId', checkObjectIdPipe) blogId: string,
  ): Promise<PageViewModel<BannedUserForBlogViewModel>> {
    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (foundBlog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    return await this.usersQueryRepo.findBannedUsersForBlog(blogId, query);
  }

  @Put(':bannedUserId/ban')
  @HttpCode(204)
  async banUserForBlog(
    @UserId() userId: string,
    @Param('bannedUserId', checkObjectIdPipe) bannedUserId: string,
    @Body() body: BanUserForBlogDto,
  ) {
    await this.commandBus.execute(new BanUserForBlogCommand(userId, bannedUserId, body));
  }
}
