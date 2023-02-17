import { Post, PostDocument } from '../domain/post.schema';
import { FindPostsQueryModel } from '../api/models/FindPostsQueryModel';
import { PostViewModel } from '../api/models/PostViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { PostLikeDetailsViewModel } from '../api/models/PostLikeDetailsViewModel';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async findPosts(dto: FindPostsQueryModel, userId: string | null): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const totalCount = await this.PostModel.countDocuments().where('isBanned', false);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundPosts = await this.PostModel.find()
      .where('isBanned', false)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const items: PostViewModel[] = [];
    for (const post of foundPosts) {
      const myStatus = await this.myLikeStatus(post.id, userId);
      const newestLikes = await this.newestLikes(post.id);
      items.push(new PostViewModel(post, myStatus, newestLikes));
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

  async findPostById(postId: string, userId: string | null): Promise<PostViewModel | null> {
    const foundPost = await this.PostModel.findOne({ _id: postId, isBanned: false }).lean();
    if (!foundPost) return null;

    const myStatus = await this.myLikeStatus(postId, userId);
    const newestLikes = await this.newestLikes(postId);
    return new PostViewModel(foundPost, myStatus, newestLikes);
  }

  async findPostsForBlog(
    blogId: string,
    userId: string | null,
    dto: FindPostsQueryModel,
  ): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const totalCount = await this.PostModel.countDocuments().where('blogId', blogId).where('isBanned', false);
    if (totalCount == 0) throw new NotFoundException('blog not found');

    const pagesCount = Math.ceil(totalCount / pageSize);

    const foundPosts = await this.PostModel.find()
      .where('blogId', blogId)
      .where('isBanned', false)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const items: PostViewModel[] = [];
    for (const post of foundPosts) {
      const myStatus = await this.myLikeStatus(post.id, userId);
      const newestLikes = await this.newestLikes(post.id);
      items.push(new PostViewModel(post, myStatus, newestLikes));
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

  private async myLikeStatus(postId: string, userId: string | null): Promise<LikeStatus> {
    let myStatus: LikeStatus = LikeStatus.None;
    if (userId) {
      const status = await this.PostLikeModel.findOne({ postId, userId }).lean();
      if (status) myStatus = status.likeStatus;
    }
    return myStatus;
  }

  private async newestLikes(postId: string): Promise<PostLikeDetailsViewModel[]> {
    const newestLikes = await this.PostLikeModel.find({
      postId,
      likeStatus: LikeStatus.Like,
      isBanned: false,
    })
      .sort('-addedAt')
      .limit(3)
      .select({ _id: 0, addedAt: 1, userId: 1, login: 1 });

    return newestLikes.map((l) => new PostLikeDetailsViewModel(l));
  }
}
