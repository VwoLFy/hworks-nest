import { UsersRepository } from '../../users/infrastructure/users-repository';
import { CommentsRepository } from '../infrastructure/comments-repository';
import { UpdateCommentDto } from './dto/UpdateCommentDto';
import { Comment, CommentatorInfo, CommentDocument } from '../domain/comment.schema';
import { LikeStatus } from '../../main/types/enums';
import { CreateCommentDto } from './dto/CreateCommentDto';
import { LikeCommentDto } from './dto/LikeCommentDto';
import { PostsRepository } from '../../posts/infrastructure/posts-repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';

@Injectable()
export class CommentsService {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<string | null> {
    const isPostExist = await this.postsRepository.findPostById(dto.postId);
    const userLogin = await this.usersRepository.findUserLoginById(dto.userId);
    if (!isPostExist || !userLogin) return null;

    const commentatorInfo = new CommentatorInfo(dto.userId, userLogin);
    const comment = new this.CommentModel({ ...dto, commentatorInfo });

    await this.commentsRepository.saveComment(comment);
    return comment.id;
  }

  async updateComment(dto: UpdateCommentDto): Promise<number> {
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

  async likeComment(dto: LikeCommentDto): Promise<boolean> {
    const { commentId, userId, likeStatus } = dto;

    const foundComment = await this.commentsRepository.findComment(commentId);
    if (!foundComment) return false;

    const foundLike = await this.commentsRepository.findLikeStatus(commentId, userId);

    const like = foundComment.setLikeStatus(foundLike, userId, likeStatus, this.CommentLikeModel);
    await this.commentsRepository.saveComment(foundComment);

    if (likeStatus === LikeStatus.None) {
      await this.commentsRepository.deleteLike(like._id);
    } else {
      await this.commentsRepository.saveLike(like);
    }
    return true;
  }

  async deleteComment(commentId: string, userId: string): Promise<number> {
    const foundComment = await this.commentsRepository.findComment(commentId);
    if (!foundComment) {
      return 404;
    } else if (foundComment.commentatorInfo.userId !== userId) {
      return 403;
    }
    return await this.commentsRepository.deleteComment(foundComment._id);
  }

  async deleteAll() {
    await this.commentsRepository.deleteAll();
  }
}
