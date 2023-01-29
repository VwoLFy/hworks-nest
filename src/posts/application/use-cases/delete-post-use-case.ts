import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

@Injectable()
export class DeletePostUseCase {
  constructor(protected postsRepository: PostsRepository, protected commentsRepository: CommentsRepository) {}

  async execute(_id: string): Promise<boolean> {
    const isDeletedPost = await this.postsRepository.deletePost(_id);
    if (!isDeletedPost) return false;

    await this.commentsRepository.deleteAllCommentsOfPost(_id);
    return true;
  }
}
