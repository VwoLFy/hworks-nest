import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/postLike.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async findUserPostLikes(userId: string): Promise<PostLike[]> {
    return await this.postLikeRepositoryT.find({ where: { userId: userId } });
  }

  async updateBanOnUserPostsLikes(userId: string, isBanned: boolean) {
    await this.postLikeRepositoryT.update({ userId: userId }, { isBanned: isBanned });
  }

  async savePostLike(like: PostLike) {
    await this.postLikeRepositoryT.save(like);
  }

  async deleteAll() {
    await this.postLikeRepositoryT.delete({});
    await this.postRepositoryT.delete({});
  }
}
