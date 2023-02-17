import { Comment, CommentDocument } from '../domain/comment.schema';
import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentLike, CommentLikeDocument } from '../domain/commentLike.schema';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindCommentsForOwnBlogsDto } from './dto/FindCommentsForOwnBlogsDto';
import { CommentViewModelBl } from '../api/models/CommentViewModel.Bl';
import { Blog, BlogDocument } from '../../blogs/domain/blog.schema';
import { Post, PostDocument } from '../../posts/domain/post.schema';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentById(commentId: string, userId: string | null): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne({ _id: commentId, isBanned: false });
    if (!foundComment) throw new NotFoundException('comment not found');

    const myStatus = await this.myLikeStatus(commentId, userId);
    return new CommentViewModel(foundComment, myStatus);
  }

  async findCommentsByPostId(dto: FindCommentsByPostIdDto): Promise<PageViewModel<CommentViewModel> | null> {
    const { postId, pageNumber, pageSize, sortBy, sortDirection, userId } = dto;

    const totalCount = await this.CommentModel.countDocuments({ postId, isBanned: false });
    if (!totalCount) return null;

    const pagesCount = Math.ceil(totalCount / pageSize);
    const foundComments = await this.CommentModel.find({ postId, isBanned: false })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const items: CommentViewModel[] = [];
    for (const comment of foundComments) {
      const myStatus = await this.myLikeStatus(comment.id, userId);
      items.push(new CommentViewModel(comment, myStatus));
    }

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  async findCommentsForOwnBlogs(dto: FindCommentsForOwnBlogsDto): Promise<PageViewModel<CommentViewModelBl>> {
    const { userId, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const foundBlogs = await this.BlogModel.find().where('blogOwnerInfo.userId', userId);
    const blogIds = foundBlogs.map((b) => b._id);
    const foundPosts = await this.PostModel.find({ blogId: blogIds });
    const postIds = foundPosts.map((p) => p._id);

    const totalCount = await this.CommentModel.countDocuments({ postId: postIds });
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundComments = await this.CommentModel.find({ postId: postIds })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const items: CommentViewModelBl[] = [];
    for (const comment of foundComments) {
      const post = foundPosts.find((p) => p._id.toString() === comment.postId);
      const myStatus = await this.myLikeStatus(comment.id, userId);
      items.push(new CommentViewModelBl(comment, post, myStatus));
    }

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  async myLikeStatus(commentId: string, userId: string | null): Promise<LikeStatus> {
    let myStatus: LikeStatus = LikeStatus.None;
    if (userId) {
      const status = await this.CommentLikeModel.findOne({ commentId, userId }).lean();
      if (status) myStatus = status.likeStatus;
    }
    return myStatus;
  }
}
