import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/postLike.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostFromDB } from './types/PostFromDB';
import { PostLikeFromDB } from './types/PostLikeFromDB';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostById(postId: string): Promise<Post | null> {
    const postFromDB: PostFromDB = (
      await this.dataSource.query(`SELECT * FROM public."Posts" WHERE "id" = $1`, [postId])
    )[0];

    if (!postFromDB) return null;
    return Post.createPostFromDB(postFromDB);
  }

  async savePost(post: Post) {
    await this.dataSource.query(
      `INSERT INTO public."Posts"("id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isBanned", "likesCount", "dislikesCount")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.createdAt,
        post.isBanned,
        post.likesCount,
        post.dislikesCount,
      ],
    );
  }

  async updateBanOnPostsOfBlog(blogId: string, isBanned: boolean) {
    await this.dataSource.query(`UPDATE public."Posts" SET "isBanned" = $1 WHERE "blogId" = $2`, [isBanned, blogId]);
  }

  async updatePostLikesCount(post: Post) {
    await this.dataSource.query(
      `UPDATE public."Posts" 
            SET "likesCount" = $1, "dislikesCount" = $2
            WHERE "id" = $3`,
      [post.likesCount, post.dislikesCount, post.id],
    );
  }

  async updatePost(post: Post) {
    await this.dataSource.query(
      `UPDATE public."Posts" 
            SET "title" = $1, "shortDescription" = $2, "content" = $3
            WHERE "id" = $4`,
      [post.title, post.shortDescription, post.content, post.id],
    );
  }

  async deletePost(postId: string) {
    await this.dataSource.query(`DELETE FROM public."Posts" WHERE "id" = $1`, [postId]);
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
    await this.dataSource.query(`DELETE FROM public."Posts"`);
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
