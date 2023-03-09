import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { SecurityService } from '../../../security/application/security.service';
import { CommentsService } from '../../../comments/application/comments.service';
import { PostsService } from '../../../posts/application/posts.service';
import { UsersService } from '../../../users/application/users.service';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersService: UsersService,
    protected commentsService: CommentsService,
    protected postsService: PostsService,
    protected securityService: SecurityService,
  ) {}

  async execute(command: BanUserCommand) {
    const { userId, dto } = command;

    const alreadyIsBanned = await this.usersService.banUser(userId, dto);
    if (alreadyIsBanned) return;

    await this.commentsService.banUserComments(userId, dto.isBanned);
    await this.commentsService.banUserCommentLikes(userId, dto.isBanned);
    await this.postsService.banUserPostLikes(userId, dto.isBanned);
    await this.securityService.deleteAllUserSessions(userId);
  }
}
