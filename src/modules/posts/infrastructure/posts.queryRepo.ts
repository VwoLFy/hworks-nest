import { Post, PostDocument } from '../domain/post.schema';
import { FindPostsQueryModel } from '../api/models/FindPostsQueryModel';
import { PostViewModel } from '../api/models/PostViewModel';
import { PostsViewModelPage } from '../api/models/PostsViewModelPage';
import { LikeStatus, SortDirection } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async findPosts(dto: FindPostsQueryModel, userId: string | null): Promise<PostsViewModelPage> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const optionsSort: { [key: string]: SortDirection } = {
      [sortBy]: sortDirection,
    };

    const totalCount = await this.PostModel.countDocuments().where('isBanned', false);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const postsWith_id = await this.PostModel.find()
      .where('isBanned', false)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(optionsSort)
      .lean();

    let items: PostViewModel[] = [];
    for (const postWith_id of postsWith_id) {
      const item = await this.postWithReplaceId(postWith_id, userId);
      items = [...items, item];
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async findPostById(postId: string, userId: string | null): Promise<PostViewModel | null> {
    const foundPost = await this.PostModel.findOne({ _id: postId, isBanned: false }).lean();
    if (!foundPost) return null;

    return this.postWithReplaceId(foundPost, userId);
  }

  async findPostsForBlog(blogId: string, userId: string | null, dto: FindPostsQueryModel): Promise<PostsViewModelPage> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const optionsSort: { [key: string]: SortDirection } = {
      [sortBy]: sortDirection,
    };

    const totalCount = await this.PostModel.countDocuments().where('blogId').equals(blogId).where('isBanned', false);
    if (totalCount == 0) throw new NotFoundException('blog not found');

    const pagesCount = Math.ceil(totalCount / pageSize);

    const postsWith_id = await this.PostModel.find()
      .where('blogId')
      .equals(blogId)
      .where('isBanned', false)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(optionsSort)
      .lean();

    let items: PostViewModel[] = [];
    for (const postWith_id of postsWith_id) {
      const item = await this.postWithReplaceId(postWith_id, userId);
      items = [...items, item];
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async postWithReplaceId(post: Post, userId: string | null): Promise<PostViewModel> {
    let myStatus: LikeStatus = LikeStatus.None;

    if (userId) {
      const status = await this.PostLikeModel.findOne({
        postId: post._id,
        userId,
      }).lean();
      if (status) myStatus = status.likeStatus;
    }

    const newestLikes1 = await this.PostLikeModel.find({
      postId: post._id,
      likeStatus: LikeStatus.Like,
      isBanned: false,
    })
      .sort('-addedAt')
      .limit(3)
      .select({ _id: 0, addedAt: 1, userId: 1, login: 1 })
      .lean();
    const newestLikes = newestLikes1.map((l) => ({
      ...l,
      addedAt: l.addedAt.toISOString(),
    }));

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: { ...post.extendedLikesInfo, myStatus, newestLikes },
    };
  }
}
