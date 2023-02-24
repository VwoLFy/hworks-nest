import { Post } from '../domain/post.schema';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostFromDB } from './types/PostFromDB';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

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
        post.extendedLikesInfo.likesCount,
        post.extendedLikesInfo.dislikesCount,
      ],
    );
  }

  async updateBanOnPostsOfBlog(blogId: string, isBanned: boolean) {
    await this.dataSource.query(`UPDATE public."Posts" SET "isBanned" = $1 WHERE "blogId" = $2`, [isBanned, blogId]);
  }

  async findPostLike(postId: string, userId: string): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }

  async findUserPostLikes(userId: string): Promise<PostLikeDocument[]> {
    return this.PostLikeModel.find({ userId });
  }

  async updateBanOnUserPostsLikes(userId: string, isBanned: boolean) {
    await this.PostLikeModel.updateMany({ userId }, { $set: { isBanned } });
  }

  async savePostLike(like: PostLikeDocument) {
    await like.save();
  }

  async deletePost(postId: string) {
    await this.dataSource.query(`DELETE FROM public."Posts" WHERE "id" = $1`, [postId]);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."Posts"`);
    await this.PostLikeModel.deleteMany();
  }

  async updatePostLikesCount(post: Post) {
    await this.dataSource.query(
      `UPDATE public."Posts" 
            SET "likesCount" = $1, "dislikesCount" = $2
            WHERE "id" = $3`,
      [post.extendedLikesInfo.likesCount, post.extendedLikesInfo.dislikesCount, post.id],
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
}
