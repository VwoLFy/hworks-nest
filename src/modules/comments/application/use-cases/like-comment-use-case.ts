import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLike, CommentLikeDocument } from '../../domain/commentLike.schema';
import { LikeCommentDto } from '../dto/LikeCommentDto';
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

    const oldLike = await this.commentsRepository.findCommentLike(commentId, userId);

    const newLike = foundComment.setLikeStatus(this.CommentLikeModel, oldLike, userId, likeStatus);

    await this.commentsRepository.saveComment(foundComment);
    await this.commentsRepository.saveCommentLike(newLike);
  }
}
