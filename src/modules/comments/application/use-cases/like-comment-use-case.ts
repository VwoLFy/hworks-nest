import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLike, CommentLikeDocument } from '../../domain/commentLike.schema';
import { LikeCommentDto } from '../dto/LikeCommentDto';
import { LikeStatus } from '../../../../main/types/enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comment.schema';

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
    const foundComment = await this.commentsRepository.findCommentOrThrowError(command.dto.commentId);

    await this.setLikeStatus(command.dto, foundComment);
  }

  async setLikeStatus(dto: LikeCommentDto, foundComment: CommentDocument) {
    const { commentId, userId, likeStatus } = dto;
    let oldLikeStatus: LikeStatus;
    let like: CommentLikeDocument;

    const oldLike = await this.commentsRepository.findCommentLike(commentId, userId);

    if (!oldLike) {
      oldLikeStatus = LikeStatus.None;
      const newLike = foundComment.newLikeStatus(dto);
      like = new this.CommentLikeModel(newLike);
    } else {
      oldLikeStatus = oldLike.likeStatus;
      like = foundComment.updateLikeStatus(oldLike, likeStatus);
    }
    foundComment.updateLikesCount(likeStatus, oldLikeStatus);

    await this.commentsRepository.saveComment(foundComment);
    await this.commentsRepository.saveCommentLike(like);
  }
}
