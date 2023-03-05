import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { LikeStatus } from '../../../main/types/enums';

@Injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}

  async banUserPostLikes(userId: string, isBanned: boolean) {
    await this.postsRepository.updateBanOnUserPostsLikes(userId, isBanned);

    const foundPostLikes = await this.postsRepository.findUserPostLikes(userId);

    for (const foundPostLike of foundPostLikes) {
      const foundPost = await this.postsRepository.findPostById(foundPostLike.postId);
      if (isBanned) {
        foundPost.updateLikesCount(LikeStatus.None, foundPostLike.likeStatus);
      } else {
        foundPost.updateLikesCount(foundPostLike.likeStatus, LikeStatus.None);
      }

      await this.postsRepository.savePost(foundPost);
    }
  }
}
