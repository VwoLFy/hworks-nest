import { PostLikesInfoViewModel } from './PostLikesInfoViewModel';
import { Post } from '../../domain/post.schema';
import { LikeStatus } from '../../../../main/types/enums';
import { PostLikeDetailsViewModel } from './PostLikeDetailsViewModel';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesInfoViewModel;

  constructor(dto: Post, myStatus: LikeStatus, newestLikes: PostLikeDetailsViewModel[]) {
    this.id = dto._id.toString();
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
    this.createdAt = dto.createdAt.toISOString();
    this.extendedLikesInfo = new PostLikesInfoViewModel(dto.extendedLikesInfo, myStatus, newestLikes);
  }
}
