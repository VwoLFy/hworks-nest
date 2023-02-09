import { Comment, CommentDocument } from '../domain/comment.schema';
import { ObjectId } from 'mongodb';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentOrThrowError(_id: string): Promise<CommentDocument> {
    const foundComment = await this.CommentModel.findById({ _id });
    if (!foundComment) throw new NotFoundException('comment not found');
    return foundComment;
  }

  async updateBanOnUserComments(userId: string, isBanned: boolean) {
    await this.CommentModel.updateMany({ 'commentatorInfo.userId': userId }, { $set: { isBanned } });
  }

  async saveComment(comment: CommentDocument) {
    await comment.save();
  }

  async findUserCommentLikes(userId: string): Promise<CommentLikeDocument[]> {
    return this.CommentLikeModel.find({ userId });
  }

  async updateBanOnUserCommentsLikes(userId: string, isBanned: boolean) {
    await this.CommentLikeModel.updateMany({ userId }, { $set: { isBanned } });
  }

  async findCommentLike(commentId: string, userId: string): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async saveCommentLike(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }

  async deleteAllCommentsOfPost(postId: string) {
    await this.CommentModel.deleteMany({ postId });
  }

  async deleteComment(_id: ObjectId) {
    await this.CommentModel.deleteOne({ _id });
    await this.CommentLikeModel.deleteMany({ commentId: _id });
  }

  async deleteAll() {
    await this.CommentModel.deleteMany();
    await this.CommentLikeModel.deleteMany();
  }
}
