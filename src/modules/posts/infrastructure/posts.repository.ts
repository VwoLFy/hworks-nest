import { Post, PostDocument } from '../domain/post.schema';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async findPostById(_id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(_id);
  }

  async savePost(newPost: PostDocument) {
    await newPost.save();
  }

  async updateBanOnPostsOfBlog(blogId: string, isBanned: boolean) {
    await this.PostModel.updateMany({ blogId }, { $set: { isBanned } });
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
    await this.PostModel.deleteOne({ _id: postId });
  }

  async deleteAllPostsOfBlog(blogId: string): Promise<boolean> {
    const result = await this.PostModel.deleteMany({ blogId });
    return result.deletedCount !== 0;
  }

  async deleteAll() {
    await this.PostModel.deleteMany();
    await this.PostLikeModel.deleteMany();
  }
}
