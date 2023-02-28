import { LikeStatus } from '../../../main/types/enums';
import { CommentLikeFromDB } from '../infrastructure/dto/CommentLikeFromDB';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CommentLikes')
export class CommentLike {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  public addedAt: Date;
  @Column('uuid')
  public commentId: string;
  @Column('uuid')
  public userId: string;
  @Column()
  public likeStatus: LikeStatus;
  @Column()
  public isBanned: boolean;

  constructor(commentId: string, userId: string) {
    this.commentId = commentId;
    this.userId = userId;
    this.likeStatus = LikeStatus.None;
    this.addedAt = new Date();
    this.isBanned = false;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }

  static createCommentLike(commentLikeFromDB: CommentLikeFromDB): CommentLike {
    const like = new CommentLike(commentLikeFromDB.commentId, commentLikeFromDB.userId);
    like.addedAt = commentLikeFromDB.addedAt;
    like.likeStatus = commentLikeFromDB.likeStatus;
    like.isBanned = commentLikeFromDB.isBanned;

    return like;
  }
}
