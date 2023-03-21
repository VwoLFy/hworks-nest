import { PostLikesInfoViewModel } from './PostLikesInfoViewModel';
import { PostLikeDetailsViewModel } from './PostLikeDetailsViewModel';
import { PostFromDB } from '../../infrastructure/types/PostFromDB';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesInfoViewModel;

  constructor(dto: PostFromDB, newestLikes: PostLikeDetailsViewModel[]) {
    this.id = dto.id;
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
    this.createdAt = dto.createdAt.toISOString();
    this.extendedLikesInfo = new PostLikesInfoViewModel(dto.likesCount, dto.dislikesCount, dto.myStatus, newestLikes);
  }
}
