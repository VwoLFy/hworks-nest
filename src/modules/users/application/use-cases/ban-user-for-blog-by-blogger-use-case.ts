import { BanUserForBlogDto } from '../dto/BanUserForBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUserForBlog, BannedUserForBlogDocument } from '../../domain/banned-user-for-blog.schema';
import { Model } from 'mongoose';

export class BanUserForBlogByBloggerCommand {
  constructor(public bloggerId: string, public bannedUserId: string, public dto: BanUserForBlogDto) {}
}

@CommandHandler(BanUserForBlogByBloggerCommand)
export class BanUserForBlogByBloggerUseCase implements ICommandHandler<BanUserForBlogByBloggerCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(BannedUserForBlog.name) private BannedUserForBlogModel: Model<BannedUserForBlogDocument>,
  ) {}

  async execute(command: BanUserForBlogByBloggerCommand) {
    const { bloggerId, bannedUserId, dto } = command;

    const foundBlog = await this.blogsRepository.findBlogById(dto.blogId);
    if (foundBlog.blogOwnerInfo.userId !== bloggerId) throw new ForbiddenException('blog is not yours');

    const foundUser = await this.usersRepository.findUserById(bannedUserId);
    if (!foundUser) throw new NotFoundException('user not found');

    if (dto.isBanned) {
      const userAlreadyIsBanned = await this.usersRepository.findBannedUserForBlog(dto.blogId, bannedUserId);
      if (userAlreadyIsBanned) return;

      const bannedUser = new BannedUserForBlog(dto.blogId, bannedUserId, foundUser.accountData.login, dto.banReason);
      const bannedUserForBlogModel = new this.BannedUserForBlogModel(bannedUser);
      await this.usersRepository.saveBannedUserForBlog(bannedUserForBlogModel);
    } else {
      await this.usersRepository.deleteBannedUserForBlog(bannedUserId);
    }
  }
}
