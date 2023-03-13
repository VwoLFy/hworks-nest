import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

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
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const manager = queryRunner.manager;
    await queryRunner.startTransaction();

    try {
      const alreadyIsBanned = await this.banUser(userId, dto, manager);
      if (alreadyIsBanned) return;

      await this.commentsRepository.updateBanOnUserCommentsTransaction(userId, dto.isBanned, manager);
      await this.updateBanOnUserCommentsLikes(userId, dto.isBanned, manager);
      await this.updateBanOnUserPostsLikes(userId, dto.isBanned, manager);
      await this.banUserSessions(userId, dto.isBanned, manager);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.status === 404) throw new NotFoundException(e.response.message);
      console.log(e);
    } finally {
      await queryRunner.release();
    }
  }

  private async banUser(userId: string, dto: BanUserDto, manager: EntityManager): Promise<boolean> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');
    if (user.banInfo.isBanned === dto.isBanned) return true;

    user.banUser(dto);
    await this.usersRepository.saveUserTransaction(user, manager);
    return false;
  }

  private async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean, manager: EntityManager) {
    await this.commentsRepository.updateBanOnUserCommentsLikesTransaction(userId, isBanned, manager);

    const foundCommentLikes = await this.commentsRepository.findUserCommentLikesWithCommentTransaction(userId, manager);
    for (const foundCommentLike of foundCommentLikes) {
      const foundComment = foundCommentLike.comment;
      foundComment.updateLikesCountAfterBan(isBanned, foundCommentLike.likeStatus);
      await this.commentsRepository.saveCommentTransaction(foundComment, manager);
    }
  }

  private async updateBanOnUserPostsLikes(userId: string, isBanned: boolean, manager: EntityManager) {
    await this.postsRepository.updateBanOnUserPostsLikesTransaction(userId, isBanned, manager);

    const foundPostLikes = await this.postsRepository.findUserPostLikesWithPostTransaction(userId, manager);
    for (const foundPostLike of foundPostLikes) {
      const foundPost = foundPostLike.post;
      foundPost.updateLikesCountAfterBan(isBanned, foundPostLike.likeStatus);
      await this.postsRepository.savePostTransaction(foundPost, manager);
    }
  }

  private async banUserSessions(userId: string, isBanned: boolean, manager: EntityManager) {
    if (isBanned) await this.securityRepository.deleteAllUserSessionsTransaction(userId, manager);
  }
}
