import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLike, CommentLikeDocument } from '../../domain/commentLike.schema';
import { LikeCommentDto } from '../dto/LikeCommentDto';
import { LikeStatus } from '../../../main/types/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LikeCommentCommand {
  constructor(public dto: LikeCommentDto) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    @InjectModel(CommentLike.name) private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async execute(command: LikeCommentCommand) {
    const { commentId, userId, likeStatus } = command.dto;

    const foundComment = await this.commentsRepository.findCommentOrThrowError(commentId);
    const foundLike = await this.commentsRepository.findLikeStatus(commentId, userId);

    const like = foundComment.setLikeStatus(foundLike, userId, likeStatus, this.CommentLikeModel);
    await this.commentsRepository.saveComment(foundComment);

    if (likeStatus === LikeStatus.None) {
      await this.commentsRepository.deleteLike(like._id);
    } else {
      await this.commentsRepository.saveLike(like);
    }
  }
}
