import { LikeStatus } from '../../../main/types/enums';
import { CreatePostLikeDto } from '../application/dto/CreatePostLikeDto';
import { PostLikeFromDB } from '../infrastructure/types/PostLikeFromDB';

export class PostLike {
  addedAt: Date;
  postId: string;
  userId: string;
  login: string;
  likeStatus: LikeStatus;
  isBanned: boolean;

  constructor(dto: CreatePostLikeDto) {
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

  static createPostLike(postLikeFromDB: PostLikeFromDB): PostLike {
    const postLike = new PostLike({ ...postLikeFromDB, userLogin: postLikeFromDB.login });
    postLike.addedAt = postLikeFromDB.addedAt;
    postLike.likeStatus = postLikeFromDB.likeStatus;
    postLike.isBanned = postLikeFromDB.isBanned;
    return postLike;
  }
}
