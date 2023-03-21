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
  isBanned: boolean;
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Post)
  post: Post;
  @OneToMany(() => CommentLike, (cl) => cl.comment, { cascade: ['update', 'insert'] })
  commentLikes: CommentLike[];

  constructor({ ...dto }: CreateCommentEntityDto) {
    this.id = randomUUID();
    this.content = dto.content;
    this.postId = dto.postId;
    this.createdAt = new Date();
    this.userId = dto.userId;
    this.userLogin = dto.userLogin;
    this.isBanned = false;
  }

  setLikeStatus(userId: string, likeStatus: LikeStatus) {
    if (this.commentLikes.length === 0) this.commentLikes.push(new CommentLike(this.id, userId));
    this.commentLikes[0].updateLikeStatus(likeStatus);
  }

  updateComment(content: string) {
    this.content = content;
  }
}
