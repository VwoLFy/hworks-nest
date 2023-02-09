import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { SecurityService } from '../../../security/application/security.service';
import { UserDocument } from '../../domain/user.schema';
import { CommentsService } from '../../../comments/application/comments.service';
import { PostsService } from '../../../posts/application/posts.service';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected commentsService: CommentsService,
    protected postsService: PostsService,
    protected securityService: SecurityService,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');
    if (user.banInfo.isBanned === dto.isBanned) return;

    await this.banUser(user, dto);

    await this.commentsService.banUserComments(userId, dto.isBanned);
    await this.commentsService.banUserCommentLikes(userId, dto.isBanned);
    await this.postsService.banUserPostLikes(userId, dto.isBanned);

    await this.securityService.deleteAllUserSessions(userId);
  }

  async banUser(user: UserDocument, dto: BanUserDto) {
    user.banUser(dto);
    await this.usersRepository.saveUser(user);
  }
}
