import { PostLikesInfoViewModel } from './PostLikesInfoViewModel';
import { LikeStatus } from '../../../../main/types/enums';
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

  constructor(dto: PostFromDB, myStatus: LikeStatus, newestLikes: PostLikeDetailsViewModel[]) {
    this.id = dto.id;
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
    this.createdAt = dto.createdAt.toISOString();
    this.extendedLikesInfo = new PostLikesInfoViewModel(dto.likesCount, dto.dislikesCount, myStatus, newestLikes);
  }
}
