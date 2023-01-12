import { CommentsQueryRepo } from '../infrastructure/comments-queryRepo';
import { CommentViewModel } from './models/CommentViewModel';
import { HTTP_Status } from '../../main/types/enums';
import { Controller, Get, HttpException, Param } from '@nestjs/common';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepo: CommentsQueryRepo) {}

  @Get(':id')
  async getComment(@Param('id') commentId): Promise<CommentViewModel> {
    const userId = null;
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      userId,
    );
    if (!foundComment)
      throw new HttpException('comment not found', HTTP_Status.NOT_FOUND_404);

    return foundComment;
  }
}
