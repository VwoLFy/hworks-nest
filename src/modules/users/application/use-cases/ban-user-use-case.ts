import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { SecurityService } from '../../../security/application/security.service';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected securityService: SecurityService,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');

    user.banUser(dto);
    await this.usersRepository.saveUser(user);

    const foundCommentLikes = await this.commentsRepository.findCommentLikesOrUser(userId);
    foundCommentLikes.forEach((l) => {
      l.setIsAllowed = !dto.isBanned;
      this.commentsRepository.saveLike(l);
    });

    const foundPostLikes = await this.postsRepository.findPostLikesOrUser(userId);
    foundPostLikes.forEach((l) => {
      l.setIsAllowed = !dto.isBanned;
      this.postsRepository.savePostLike(l);
    });

    await this.securityService.deleteAllUserSessions(userId);
  }
}
