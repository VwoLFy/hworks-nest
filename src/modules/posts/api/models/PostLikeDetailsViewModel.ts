import { PostLike } from '../../domain/postLike.entity';

export class PostLikeDetailsViewModel {
  addedAt: string;
  userId: string;
  login: string;

  constructor(like: PostLike) {
    this.addedAt = like.addedAt.toISOString();
    this.userId = like.userId;
    this.login = like.login;
  }
}
