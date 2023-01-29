import { CommentsQueryRepo } from '../infrastructure/comments.queryRepo';
import { CommentViewModel } from './models/CommentViewModel';
import { HTTP_Status } from '../../main/types/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentInputModel } from './models/CommentInputModel';
import { checkObjectIdPipe } from '../../main/checkObjectIdPipe';
import { CommentLikeInputModel } from './models/CommentLikeInputModel';
import { UserId } from '../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../main/guards/get-user-id.guard';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { UpdateCommentUseCase } from '../application/use-cases/update-comment-use-case';
import { DeleteCommentUseCase } from '../application/use-cases/delete-comment-use-case';
import { LikeCommentUseCase } from '../application/use-cases/like-comment-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepo: CommentsQueryRepo,
    protected updateCommentUseCase: UpdateCommentUseCase,
    protected likeCommentUseCase: LikeCommentUseCase,
    protected deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Get(':id')
  @UseGuards(GetUserIdGuard)
  async getComment(
    @Param('id', checkObjectIdPipe) commentId: string,
    @UserId() userId: string | null,
  ): Promise<CommentViewModel> {
    const foundComment = await this.commentsQueryRepo.findCommentById(commentId, userId);
    if (!foundComment) throw new HttpException('comment not found', HTTP_Status.NOT_FOUND_404);

    return foundComment;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('id', checkObjectIdPipe) commentId: string,
    @Body() body: CommentInputModel,
    @UserId() userId: string | null,
  ) {
    const updateStatus = await this.updateCommentUseCase.execute({
      commentId,
      content: body.content,
      userId,
    });
    if (updateStatus !== 204) throw new HttpException('Error', updateStatus);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async likeComment(
    @Param('id', checkObjectIdPipe) commentId: string,
    @Body() body: CommentLikeInputModel,
    @UserId() userId: string | null,
  ) {
    const result = await this.likeCommentUseCase.execute({
      commentId,
      userId,
      likeStatus: body.likeStatus,
    });
    if (!result) throw new NotFoundException('comment not found');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteComment(@Param('id', checkObjectIdPipe) commentId: string, @UserId() userId: string | null) {
    const deleteStatus = await this.deleteCommentUseCase.execute(commentId, userId);
    if (deleteStatus !== 204) throw new HttpException('Error', deleteStatus);
  }
}
