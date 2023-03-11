import { LikeStatus } from '../../../main/types/enums';
import { CommentLike } from './commentLike.entity';
import { randomUUID } from 'crypto';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { CreateCommentEntityDto } from '../application/dto/CreateCommentEntityDto';

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
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Post)
  post: Post;
  @OneToMany(() => CommentLike, (cl) => cl.comment)
  commentLikes: CommentLike[];

  constructor({ ...dto }: CreateCommentEntityDto) {
    this.id = randomUUID();
    this.content = dto.content;
    this.postId = dto.postId;
    this.createdAt = new Date();
    this.userId = dto.userId;
    this.userLogin = dto.userLogin;
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

  updateLikesCount(newLikeStatus: LikeStatus, oldLikeStatus: LikeStatus) {
    if (newLikeStatus === LikeStatus.Like && oldLikeStatus !== LikeStatus.Like) {
      this.likesCount += 1;
    } else if (newLikeStatus === LikeStatus.Dislike && oldLikeStatus !== LikeStatus.Dislike) {
      this.dislikesCount += 1;
    }
    if (newLikeStatus !== LikeStatus.Like && oldLikeStatus === LikeStatus.Like) {
      this.likesCount -= 1;
    } else if (newLikeStatus !== LikeStatus.Dislike && oldLikeStatus === LikeStatus.Dislike) {
      this.dislikesCount -= 1;
    }
  }

  updateComment(content: string) {
    this.content = content;
  }

  updateLikesCountAfterBan(isBanned: boolean, likeStatus: LikeStatus) {
    if (isBanned) {
      this.updateLikesCount(LikeStatus.None, likeStatus);
    } else {
      this.updateLikesCount(likeStatus, LikeStatus.None);
    }
  }
}
