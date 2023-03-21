import { Post } from '../domain/post.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectRepository(Post) private readonly postRepositoryT: Repository<Post>) {}

  async findPostById(postId: string): Promise<Post | null> {
    return await this.postRepositoryT.findOne({ where: { id: postId } });
  }

  async savePost(post: Post) {
    await this.postRepositoryT.save(post);
  }

  async deletePost(postId: string) {
    await this.postRepositoryT.delete({ id: postId });
  }

  async findPostWithLikeOfUser(postId: string, userId: string): Promise<Post> {
    return this.postRepositoryT
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.postLikes', 'pl', 'pl.userId = :userId', { userId })
      .where('p.id = :postId', { postId })
      .getOne();
  }
}
