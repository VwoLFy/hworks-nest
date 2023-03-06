import { LikeStatus } from '../../../main/types/enums';
import { CreatePostLikeDto } from '../application/dto/CreatePostLikeDto';
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
  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  constructor({ ...dto }: CreatePostLikeDto) {
    this.postId = dto.postId;
    this.userId = dto.userId;
    this.login = dto.userLogin;
    this.likeStatus = LikeStatus.None;
    this.addedAt = new Date();
    this.isBanned = false;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }
}
