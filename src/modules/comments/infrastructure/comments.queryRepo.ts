import { Comment, CommentDocument } from '../domain/comment.schema';
import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { PaginationPageModel } from '../../../main/types/PaginationPageModel';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentById(_id: string, userId: string | null): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne({ _id, isBanned: false }).lean();
    if (!foundComment) throw new NotFoundException('comment not found');

    return this.commentWithReplaceId(foundComment, userId);
  }

  async findCommentsByPostId(dto: FindCommentsByPostIdDto): Promise<PageViewModel<CommentViewModel> | null> {
    const { postId, pageNumber, pageSize, sortBy, sortDirection, userId } = dto;

    const sortOptions = { [sortBy]: sortDirection };
    const totalCount = await this.CommentModel.countDocuments({ postId, isBanned: false });
    if (!totalCount) return null;

    const pagesCount = Math.ceil(totalCount / pageSize);
    const commentsWith_id = await this.CommentModel.find({ postId, isBanned: false })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(sortOptions)
      .lean();

    let items: CommentViewModel[] = [];
    for (const commentWith_id of commentsWith_id) {
      const item = await this.commentWithReplaceId(commentWith_id, userId);
      items = [...items, item];
    }

    const paginationPage = new PaginationPageModel({
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
    });
    return { ...paginationPage, items };
  }

  async commentWithReplaceId(comment: Comment, userId: string | null): Promise<CommentViewModel> {
    let myStatus: LikeStatus = LikeStatus.None;
    if (userId) {
      const status = await this.CommentLikeModel.findOne({
        commentId: comment._id,
        userId,
      }).lean();
      if (status) myStatus = status.likeStatus;
    }

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt.toISOString(),
      likesInfo: { ...comment.likesInfo, myStatus: myStatus },
    };
  }
}
