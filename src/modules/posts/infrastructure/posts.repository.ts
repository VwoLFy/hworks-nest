import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/postLike.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postRepositoryT: Repository<Post>,
    @InjectRepository(PostLike) private readonly postLikeRepositoryT: Repository<PostLike>,
  ) {}

  async findPostById(postId: string): Promise<Post | null> {
    return await this.postRepositoryT.findOne({ where: { id: postId } });
  }

  async savePost(post: Post) {
    await this.postRepositoryT.save(post);
  }

  async savePostTransaction(post: Post, manager: EntityManager) {
    await manager.save(post);
  }

  async updateBanOnPostsOfBlog(blogId: string, isBanned: boolean) {
    await this.postRepositoryT.update({ blogId: blogId }, { isBanned: isBanned });
  }

  async deletePost(postId: string) {
    await this.postRepositoryT.delete({ id: postId });
  }

  async findPostLike(postId: string, userId: string): Promise<PostLike | null> {
    return await this.postLikeRepositoryT.findOne({
      where: { postId: postId, userId: userId },
    });
  }

  async findUserPostLikesWithPostTransaction(userId: string, manager: EntityManager): Promise<PostLike[]> {
    return await manager.find(PostLike, { relations: { post: true }, where: { userId: userId } });
  }

  async updateBanOnUserPostsLikesTransaction(userId: string, isBanned: boolean, manager: EntityManager) {
    await manager.update(PostLike, { userId: userId }, { isBanned: isBanned });
  }

  async savePostLike(like: PostLike) {
    await this.postLikeRepositoryT.save(like);
  }

  async deleteAll() {
    await this.postLikeRepositoryT.delete({});
    await this.postRepositoryT.delete({});
  }
}
