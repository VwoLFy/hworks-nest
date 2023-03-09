import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LikeStatus } from '../../../main/types/enums';
import { PostLike } from './postLike.entity';
import { CreatePostDto } from '../../blogger.blogs/application/dto/CreatePostDto';
import { randomUUID } from 'crypto';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';

@Entity('Posts')
export class Post {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column('uuid')
  blogId: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: Date;
  @Column()
  isBanned: boolean;
  @Column()
  likesCount: number;
  @Column()
  dislikesCount: number;
  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  blog: Blog;
  @OneToMany(() => PostLike, (pl) => pl.post)
  postLikes: PostLike[];

  constructor({ ...dto }: CreatePostDto, blogName: string) {
    this.id = randomUUID();
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
    this.isBanned = false;
    this.likesCount = 0;
    this.dislikesCount = 0;
  }

  updatePost(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  setLikeStatus(like: PostLike | null, userId: string, userLogin: string, likeStatus: LikeStatus): PostLike {
    if (!like) like = this.createLikeStatus(userId, userLogin);

    const oldLikeStatus = like.likeStatus;
    like.updateLikeStatus(likeStatus);

    this.updateLikesCount(likeStatus, oldLikeStatus);

    return like;
  }

  createLikeStatus(userId: string, userLogin: string): PostLike {
    return new PostLike(this.id, userId, userLogin);
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
}
