import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LikeStatus } from '../../../main/types/enums';
import { PostLike } from './postLike.schema';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { randomUUID } from 'crypto';
import { PostFromDB } from '../infrastructure/types/PostFromDB';

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;

  constructor() {
    this.likesCount = 0;
    this.dislikesCount = 0;
  }
}

export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  isBanned: boolean;
  extendedLikesInfo: ExtendedLikesInfo;

  constructor(dto: CreatePostDto, blogName: string) {
    this.id = randomUUID();
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
    this.isBanned = false;
    this.extendedLikesInfo = new ExtendedLikesInfo();
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
    return new PostLike({
      postId: this.id,
      userId,
      userLogin,
    });
  }

  updateLikesCount(likeStatus: LikeStatus, oldLikeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like && oldLikeStatus !== LikeStatus.Like) {
      this.extendedLikesInfo.likesCount += 1;
    } else if (likeStatus === LikeStatus.Dislike && oldLikeStatus !== LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount += 1;
    }
    if (likeStatus !== LikeStatus.Like && oldLikeStatus === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount -= 1;
    } else if (likeStatus !== LikeStatus.Dislike && oldLikeStatus === LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount -= 1;
    }
  }

  static createPostFromDB(postFromDB: PostFromDB) {
    const post = new Post(postFromDB, postFromDB.blogName);
    post.id = postFromDB.id;
    post.createdAt = postFromDB.createdAt;
    post.isBanned = postFromDB.isBanned;
    post.extendedLikesInfo.likesCount = postFromDB.likesCount;
    post.extendedLikesInfo.dislikesCount = postFromDB.dislikesCount;
    return post;
  }
}
