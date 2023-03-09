import { BanUserForBlogDto } from '../dto/BanUserForBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BannedUserForBlog } from '../../domain/banned-user-for-blog.entity';
import { BloggerUsersRepository } from '../../infrastructure/blogger.users.repository';

export class BanUserForBlogByBloggerCommand {
  constructor(public bloggerId: string, public bannedUserId: string, public dto: BanUserForBlogDto) {}
}

@CommandHandler(BanUserForBlogByBloggerCommand)
export class BanUserForBlogByBloggerUseCase implements ICommandHandler<BanUserForBlogByBloggerCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected bannedUsersForBlogRepository: BloggerUsersRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BanUserForBlogByBloggerCommand) {
    const { bloggerId, bannedUserId, dto } = command;

    const foundBlog = await this.blogsRepository.findBlogById(dto.blogId);
    if (foundBlog.userId !== bloggerId) throw new ForbiddenException('blog is not yours');

    const foundUser = await this.usersRepository.findUserById(bannedUserId);
    if (!foundUser) throw new NotFoundException('user not found');

    if (dto.isBanned) {
      const userAlreadyIsBanned = await this.bannedUsersForBlogRepository.findBannedUserForBlog(
        dto.blogId,
        bannedUserId,
      );
      if (userAlreadyIsBanned) return;

      const bannedUser = new BannedUserForBlog(dto.blogId, bannedUserId, foundUser.accountData.login, dto.banReason);
      await this.bannedUsersForBlogRepository.saveBannedUserForBlog(bannedUser);
    } else {
      await this.bannedUsersForBlogRepository.deleteBannedUserForBlog(bannedUserId, dto.blogId);
    }
  }
}
