import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
    protected securityRepository: SecurityRepository,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const alreadyIsBanned = await this.banUser(userId, dto);
    if (alreadyIsBanned) return;

    await this.commentsRepository.updateBanOnUserComments(userId, dto.isBanned);
    await this.updateBanOnUserCommentsLikes(userId, dto.isBanned);
    await this.updateBanOnUserPostsLikes(userId, dto.isBanned);
    await this.banUserSessions(userId, dto.isBanned);
  }

  private async banUser(userId: string, dto: BanUserDto): Promise<boolean> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');
    if (user.banInfo.isBanned === dto.isBanned) return true;

    user.banUser(dto);
    await this.usersRepository.saveUser(user);
    return false;
  }

  private async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean) {
    await this.commentsRepository.updateBanOnUserCommentsLikes(userId, isBanned);

    const foundCommentLikes = await this.commentsRepository.findUserCommentLikesWithComment(userId);
    for (const foundCommentLike of foundCommentLikes) {
      const foundComment = foundCommentLike.comment;
      foundComment.updateLikesCountAfterBan(isBanned, foundCommentLike.likeStatus);
      await this.commentsRepository.saveComment(foundComment);
    }
  }

  private async updateBanOnUserPostsLikes(userId: string, isBanned: boolean) {
    await this.postsRepository.updateBanOnUserPostsLikes(userId, isBanned);

    const foundPostLikes = await this.postsRepository.findUserPostLikesWithPost(userId);
    for (const foundPostLike of foundPostLikes) {
      const foundPost = foundPostLike.post;
      foundPost.updateLikesCountAfterBan(isBanned, foundPostLike.likeStatus);
      await this.postsRepository.savePost(foundPost);
    }
  }

  private async banUserSessions(userId: string, isBanned: boolean) {
    if (isBanned) await this.securityRepository.deleteAllUserSessions(userId);
  }
}
