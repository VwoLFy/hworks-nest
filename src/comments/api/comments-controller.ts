import { CommentsQueryRepo } from '../infrastructure/comments-queryRepo';
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../application/comments-service';
import { CommentInputModel } from './models/CommentInputModel';
import { Request } from 'express';
import { paramForMongoDBPipe } from '../../main/paramForMongoDBPipe';
import { CommentLikeInputModel } from './models/CommentLikeInputModel';
import { AuthGuard } from '../../auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepo: CommentsQueryRepo, protected commentsService: CommentsService) {}

  @Get(':id')
  async getComment(@Param('id', paramForMongoDBPipe) commentId, @Req() req: Request): Promise<CommentViewModel> {
    const userId = req.userId ? req.userId : null;
    const foundComment = await this.commentsQueryRepo.findCommentById(commentId, userId);
    if (!foundComment) throw new HttpException('comment not found', HTTP_Status.NOT_FOUND_404);

    return foundComment;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('id', paramForMongoDBPipe) commentId,
    @Body() body: CommentInputModel,
    @Req() req: Request,
  ) {
    const updateStatus = await this.commentsService.updateComment({
      commentId,
      content: body.content,
      userId: req.userId,
    });
    if (updateStatus !== 204) throw new HttpException('Error', updateStatus);
  }

  @Put(':id/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async likeComment(
    @Param('id', paramForMongoDBPipe) commentId,
    @Body() body: CommentLikeInputModel,
    @Req() req: Request,
  ) {
    const result = await this.commentsService.likeComment({
      commentId,
      userId: req.userId,
      likeStatus: body.likeStatus,
    });
    if (!result) throw new NotFoundException('comment not found');
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteComment(@Param('id', paramForMongoDBPipe) commentId, @Req() req: Request) {
    const deleteStatus = await this.commentsService.deleteComment(commentId, req.userId);
    if (deleteStatus !== 204) throw new HttpException('Error', deleteStatus);
  }
}
