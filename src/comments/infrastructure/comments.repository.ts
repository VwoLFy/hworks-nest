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

  async saveComment(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findLikeStatus(commentId: string, userId: string): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async saveLike(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }

  async deleteAllCommentsOfPost(postId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteMany({ postId });
    return result.deletedCount !== 0;
  }

  async deleteLike(_id: ObjectId): Promise<void> {
    await this.CommentLikeModel.deleteOne({ _id });
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
