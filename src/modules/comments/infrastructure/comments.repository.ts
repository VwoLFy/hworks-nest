import { Comment } from '../domain/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectRepository(Comment) private readonly commentRepositoryT: Repository<Comment>) {}

  async findCommentOrThrowError(commentId: string): Promise<Comment> {
    const foundComment = await this.commentRepositoryT.findOne({ where: { id: commentId } });

    if (!foundComment) throw new NotFoundException('comment not found');
    return foundComment;
  }

  async findCommentWithLikeOfUser(commentId: string, userId: string): Promise<Comment> {
    return this.commentRepositoryT
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.commentLikes', 'cl', 'cl.userId = :userId', { userId: userId })
      .where('c.id = :commentId', { commentId: commentId })
      .getOne();
  }

  async saveComment(comment: Comment) {
    await this.commentRepositoryT.save(comment);
  }

  async deleteComment(commentId: string) {
    await this.commentRepositoryT.delete({ id: commentId });
  }
}
