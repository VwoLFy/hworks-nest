import { LikeStatus } from '../../../main/types/enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Comment } from './comment.entity';

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
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Comment, (c) => c.commentLikes, { orphanedRowAction: 'disable', onDelete: 'CASCADE' })
  comment: Comment;

  constructor(commentId: string, userId: string) {
    this.commentId = commentId;
    this.userId = userId;
    this.likeStatus = LikeStatus.None;
    this.addedAt = new Date();
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }
}
