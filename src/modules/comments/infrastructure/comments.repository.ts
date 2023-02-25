import { Comment } from '../domain/comment.schema';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentFromDB } from './dto/CommentFromDB';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentOrThrowError(commentId: string): Promise<Comment> {
    const commentFromDB: CommentFromDB = (
      await this.dataSource.query(
        `SELECT * FROM public."Comments"
            WHERE "id" = $1`,
        [commentId],
      )
    )[0];
    if (!commentFromDB) throw new NotFoundException('comment not found');
    return Comment.createCommentFromDB(commentFromDB);
  }

  async updateBanOnUserComments(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."Comments"
            SET "isBanned" = $1
            WHERE "userId" = $2`,
      [isBanned, userId],
    );
  }

  async saveComment(comment: Comment) {
    await this.dataSource.query(
      `INSERT INTO public."Comments"("id", "content", "postId", "createdAt", "isBanned", "userId", "userLogin", "likesCount", "dislikesCount")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        comment.id,
        comment.content,
        comment.postId,
        comment.createdAt,
        comment.isBanned,
        comment.commentatorInfo.userId,
        comment.commentatorInfo.userLogin,
        comment.likesInfo.likesCount,
        comment.likesInfo.dislikesCount,
      ],
    );
  }

  async updateCommentLikesCount(comment: Comment) {
    await this.dataSource.query(
      `UPDATE public."Comments" 
            SET "likesCount" = $1, "dislikesCount" = $2
            WHERE "id" = $3`,
      [comment.likesInfo.likesCount, comment.likesInfo.dislikesCount, comment.id],
    );
  }

  async findUserCommentLikes(userId: string): Promise<CommentLikeDocument[]> {
    return this.CommentLikeModel.find({ userId });
  }

  async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean) {
    await this.CommentLikeModel.updateMany({ userId }, { $set: { isBanned } });
  }

  async findCommentLike(commentId: string, userId: string): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async saveCommentLike(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }

  async deleteComment(commentId: string) {
    await this.CommentLikeModel.deleteMany({ commentId: commentId });
    await this.dataSource.query(`DELETE FROM public."Comments" WHERE "id" = $1`, [commentId]);
  }

  async deleteAll() {
    await this.CommentLikeModel.deleteMany();
    await this.dataSource.query(`DELETE FROM public."Comments"`);
  }

  async updateComment(comment: Comment) {
    await this.dataSource.query(
      `UPDATE public."Comments" 
            SET "content" = $1
            WHERE "id" = $2`,
      [comment.content, comment.id],
    );
  }
}
