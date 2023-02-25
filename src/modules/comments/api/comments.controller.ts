import { CommentsQueryRepo } from '../infrastructure/comments.queryRepo';
import { CommentViewModel } from './models/CommentViewModel';
import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { CommentInputModel } from './models/CommentInputModel';
import { CommentLikeInputModel } from './models/CommentLikeInputModel';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';
import { LikeCommentCommand } from '../application/use-cases/like-comment-use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepo: CommentsQueryRepo, private commandBus: CommandBus) {}

  @Get(':commentId')
  @UseGuards(GetUserIdGuard)
  async findCommentById(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @UserId() userId: string | null,
  ): Promise<CommentViewModel> {
    return await this.commentsQueryRepo.findCommentById(commentId, userId);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() body: CommentInputModel,
    @UserId() userId: string | null,
  ) {
    await this.commandBus.execute(new UpdateCommentCommand({ commentId, content: body.content, userId }));
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async likeComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() body: CommentLikeInputModel,
    @UserId() userId: string | null,
  ) {
    await this.commandBus.execute(new LikeCommentCommand({ commentId, userId, likeStatus: body.likeStatus }));
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteComment(@Param('commentId', ParseUUIDPipe) commentId: string, @UserId() userId: string | null) {
    await this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
  }
}
