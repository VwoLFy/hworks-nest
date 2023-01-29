import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../dto/UpdateCommentDto';

@Injectable()
export class UpdateCommentUseCase {
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(dto: UpdateCommentDto): Promise<number> {
    const { commentId, content, userId } = dto;

    const foundComment = await this.commentsRepository.findComment(commentId);
    if (!foundComment) {
      return 404;
    } else if (foundComment.commentatorInfo.userId !== userId) {
      return 403;
    }

    foundComment.updateComment(content);
    await this.commentsRepository.saveComment(foundComment);
    return 204;
  }
}
