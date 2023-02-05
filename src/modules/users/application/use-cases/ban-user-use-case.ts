import { UsersRepository } from '../../infrastructure/users.repository';
import { User, UserDocument } from '../../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/BanUserDto';
import { NotFoundException } from '@nestjs/common';
import { SecurityService } from '../../../security/application/security.service';
import { CommentLikeDocument } from '../../../comments/domain/commentLike.schema';
import { Comment } from '../../../comments/domain/comment.schema';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

export class BanUserCommand {
  constructor(public userId: string, public dto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    protected securityService: SecurityService,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(Comment.name) private CommentLike: Model<CommentLikeDocument>,
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

    await this.securityService.deleteAllUserSessions(userId);
  }
}
