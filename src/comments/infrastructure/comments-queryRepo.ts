import { Comment, CommentDocument } from '../domain/comment.schema';
import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { CommentViewModelPage } from '../api/models/CommentViewModelPage';
import { LikeStatus } from '../../main/types/enums';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentById(
    _id: string,
    userId: string | null,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findById({
      _id,
    }).lean();
    if (!foundComment) return null;

    return this.commentWithReplaceId(foundComment, userId);
  }

  async findCommentsByPostId(
    dto: FindCommentsByPostIdDto,
  ): Promise<CommentViewModelPage | null> {
    const { postId, page, pageSize, sortBy, sortDirection, userId } = dto;

    const sortByField = sortBy === 'id' ? '_id' : sortBy;
    const sortOptions = { [sortByField]: sortDirection };
    const totalCount = await this.CommentModel.countDocuments({ postId });
    if (!totalCount) return null;

    const pagesCount = Math.ceil(totalCount / pageSize);
    const commentsWith_id = await this.CommentModel.find({ postId })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(sortOptions)
      .lean();

    let items: CommentViewModel[] = [];
    for (const commentWith_id of commentsWith_id) {
      const item = await this.commentWithReplaceId(commentWith_id, userId);
      items = [...items, item];
    }

    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items,
    };
  }

  async commentWithReplaceId(
    comment: Comment,
    userId: string | null,
  ): Promise<CommentViewModel> {
    let myStatus: LikeStatus = LikeStatus.None;
    if (userId) {
      const status = await this.CommentLikeModel.findOne({
        commentId: comment._id,
        userId,
      }).lean();
      if (status) myStatus = status.likeStatus;
    }
    const likesInfo = { ...comment.likesInfo, myStatus: myStatus };
    return {
      id: comment._id.toString(),
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      createdAt: comment.createdAt,
      likesInfo,
    };
  }
}
