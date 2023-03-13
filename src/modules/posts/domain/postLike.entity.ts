import { LikeStatus } from '../../../main/types/enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Post } from './post.entity';

@Entity('PostLikes')
export class PostLike {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  addedAt: Date;
  @Column('uuid')
  postId: string;
  @Column('uuid')
  userId: string;
  @Column()
  login: string;
  @Column()
  likeStatus: LikeStatus;
  @Column()
  isBanned: boolean;
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Post, p => p.postLikes,{ onDelete: 'CASCADE' })
  post: Post;

  constructor(postId: string, userId: string, userLogin: string) {
    this.postId = postId;
    this.userId = userId;
    this.login = userLogin;
    this.likeStatus = LikeStatus.None;
    this.addedAt = new Date();
    this.isBanned = false;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }
}
