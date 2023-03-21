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
  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  blog: Blog;
  @OneToMany(() => PostLike, (pl) => pl.post, { cascade: ['update', 'insert'] })
  postLikes: PostLike[];

  constructor({ ...dto }: CreatePostDto, blogName: string) {
    this.id = randomUUID();
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
  }

  updatePost(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  setLikeStatus(userId: string, userLogin: string, likeStatus: LikeStatus) {
    if (this.postLikes.length === 0) this.postLikes.push(new PostLike(this.id, userId, userLogin));
    this.postLikes[0].updateLikeStatus(likeStatus);
  }
}
