import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/postLike.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostLikeFromDB } from './types/PostLikeFromDB';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private readonly postRepositoryT: Repository<Post>,
  ) {}

  async findPostById(postId: string): Promise<Post | null> {
    return await this.postRepositoryT.findOne({
      where: { id: postId },
    });
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
    const postLikeFromDB: PostLikeFromDB = (
      await this.dataSource.query(`SELECT * FROM public."PostLikes" WHERE "postId" = $1 AND "userId" = $2`, [
        postId,
        userId,
      ])
    )[0];

    if (!postLikeFromDB) return null;
    return PostLike.createPostLike(postLikeFromDB);
  }

  async findUserPostLikes(userId: string): Promise<PostLike[]> {
    const postLikesFromDB: PostLikeFromDB[] = await this.dataSource.query(
      `SELECT * FROM public."PostLikes" WHERE "userId" = $1`,
      [userId],
    );
    return postLikesFromDB.map((l) => PostLike.createPostLike(l));
  }

  async updateBanOnUserPostsLikes(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."PostLikes"
            SET "isBanned" = $1
            WHERE "userId" = $2`,
      [isBanned, userId],
    );
  }

  async savePostLike(like: PostLike) {
    await this.dataSource.query(
      `INSERT INTO public."PostLikes"("addedAt", "postId", "userId", "login", "likeStatus", "isBanned")
            VALUES ($1, $2, $3, $4, $5, $6);`,
      [like.addedAt, like.postId, like.userId, like.login, like.likeStatus, like.isBanned],
    );
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."PostLikes"`);
    await this.postRepositoryT.delete({});
  }

  async updatePostLike(like: PostLike) {
    await this.dataSource.query(
      `UPDATE public."PostLikes"
            SET "likeStatus" = $1
            WHERE "postId" = $2 AND "userId" = $3`,
      [like.likeStatus, like.postId, like.userId],
    );
  }
}
