import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/commentLike.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentFromDB } from './dto/CommentFromDB';
import { CommentLikeFromDB } from './dto/CommentLikeFromDB';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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
        comment.userId,
        comment.userLogin,
        comment.likesCount,
        comment.dislikesCount,
      ],
    );
  }

  async updateCommentLikesCount(comment: Comment) {
    await this.dataSource.query(
      `UPDATE public."Comments" 
            SET "likesCount" = $1, "dislikesCount" = $2
            WHERE "id" = $3`,
      [comment.likesCount, comment.dislikesCount, comment.id],
    );
  }

  async findUserCommentLikes(userId: string): Promise<CommentLike[]> {
    const commentLikesFromDB: CommentLikeFromDB[] = await this.dataSource.query(
      `SELECT * FROM public."CommentLikes" WHERE "userId" = $1`,
      [userId],
    );
    return commentLikesFromDB.map((l) => CommentLike.createCommentLike(l));
  }

  async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."CommentLikes"
            SET "isBanned" = $1
            WHERE "userId" = $2`,
      [isBanned, userId],
    );
  }

  async findCommentLike(commentId: string, userId: string): Promise<CommentLike | null> {
    const commentLikeFromDB: CommentLikeFromDB = (
      await this.dataSource.query(`SELECT * FROM public."CommentLikes" WHERE "commentId" = $1 AND "userId" = $2`, [
        commentId,
        userId,
      ])
    )[0];

    if (!commentLikeFromDB) return null;
    return CommentLike.createCommentLike(commentLikeFromDB);
  }

  async saveCommentLike(like: CommentLike): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO public."CommentLikes"("addedAt", "commentId", "userId", "likeStatus", "isBanned")
            VALUES ($1, $2, $3, $4, $5);`,
      [like.addedAt, like.commentId, like.userId, like.likeStatus, like.isBanned],
    );
  }

  async deleteComment(commentId: string) {
    await this.dataSource.query(`DELETE FROM public."CommentLikes" WHERE "commentId" = $1`, [commentId]);
    await this.dataSource.query(`DELETE FROM public."Comments" WHERE "id" = $1`, [commentId]);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."CommentLikes"`);
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

  async updateCommentLike(like: CommentLike) {
    await this.dataSource.query(
      `UPDATE public."CommentLikes"
            SET "likeStatus" = $1
            WHERE "commentId" = $2 AND "userId" = $3`,
      [like.likeStatus, like.commentId, like.userId],
    );
  }
}
