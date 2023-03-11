import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/commentLike.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private readonly commentRepositoryT: Repository<Comment>,
    @InjectRepository(CommentLike) private readonly commentLikeRepositoryT: Repository<CommentLike>,
  ) {}

  async findCommentOrThrowError(commentId: string): Promise<Comment> {
    const foundComment = await this.commentRepositoryT.findOne({ where: { id: commentId } });

    if (!foundComment) throw new NotFoundException('comment not found');
    return foundComment;
  }

  async updateBanOnUserComments(userId: string, isBanned: boolean) {
    await this.commentRepositoryT.update({ userId: userId }, { isBanned: isBanned });
  }

  async saveComment(comment: Comment) {
    await this.commentRepositoryT.save(comment);
  }

  async deleteComment(commentId: string) {
    await this.commentRepositoryT.delete({ id: commentId });
  }

  async findUserCommentLikesWithComment(userId: string): Promise<CommentLike[]> {
    return await this.commentLikeRepositoryT.find({ relations: { comment: true }, where: { userId: userId } });
  }

  async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean) {
    await this.commentLikeRepositoryT.update({ userId: userId }, { isBanned: isBanned });
  }

  async findCommentLike(commentId: string, userId: string): Promise<CommentLike | null> {
    return await this.commentLikeRepositoryT.findOne({
      where: { commentId: commentId, userId: userId },
    });
  }

  async saveCommentLike(like: CommentLike): Promise<void> {
    await this.commentLikeRepositoryT.save(like);
  }

  async deleteAll() {
    await this.commentLikeRepositoryT.delete({});
    await this.commentRepositoryT.delete({});
  }
}
