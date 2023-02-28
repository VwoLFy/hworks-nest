import { LikeStatus } from '../../../main/types/enums';
import { CommentLike } from './commentLike.entity';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { randomUUID } from 'crypto';
import { CommentFromDB } from '../infrastructure/dto/CommentFromDB';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Comments')
export class Comment {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column('uuid')
  userId: string;
  @Column()
  userLogin: string;
  @Column('uuid')
  postId: string;
  @Column()
  createdAt: Date;
  @Column()
  likesCount: number;
  @Column()
  dislikesCount: number;
  @Column()
  isBanned: boolean;

  constructor({ ...dto }: CreateCommentDto, userLogin: string) {
    this.id = randomUUID();
    this.content = dto.content;
    this.postId = dto.postId;
    this.createdAt = new Date();
    this.userId = dto.userId;
    this.userLogin = userLogin;
    this.isBanned = false;
    this.likesCount = 0;
    this.dislikesCount = 0;
  }

  setLikeStatus(like: CommentLike | null, userId: string, likeStatus: LikeStatus): CommentLike {
    if (!like) like = this.createLikeStatus(userId);

    const oldLikeStatus = like.likeStatus;
    like.updateLikeStatus(likeStatus);

    this.updateLikesCount(likeStatus, oldLikeStatus);

    return like;
  }

  createLikeStatus(userId: string): CommentLike {
    return new CommentLike(this.id, userId);
  }

  updateLikesCount(likeStatus: LikeStatus, oldLikeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like && oldLikeStatus !== LikeStatus.Like) {
      this.likesCount += 1;
    } else if (likeStatus === LikeStatus.Dislike && oldLikeStatus !== LikeStatus.Dislike) {
      this.dislikesCount += 1;
    }
    if (likeStatus !== LikeStatus.Like && oldLikeStatus === LikeStatus.Like) {
      this.likesCount -= 1;
    } else if (likeStatus !== LikeStatus.Dislike && oldLikeStatus === LikeStatus.Dislike) {
      this.dislikesCount -= 1;
    }
  }
  updateComment(content: string) {
    this.content = content;
  }

  static createCommentFromDB(commentFromDB: CommentFromDB): Comment {
    const comment = new Comment(commentFromDB, commentFromDB.userLogin);
    comment.id = commentFromDB.id;
    comment.createdAt = commentFromDB.createdAt;
    comment.isBanned = commentFromDB.isBanned;
    comment.likesCount = commentFromDB.likesCount;
    comment.dislikesCount = commentFromDB.dislikesCount;
    return comment;
  }
}
