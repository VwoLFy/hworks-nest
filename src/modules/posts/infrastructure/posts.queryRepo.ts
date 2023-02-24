import { Post } from '../domain/post.schema';
import { FindPostsQueryModel } from '../api/models/FindPostsQueryModel';
import { PostViewModel } from '../api/models/PostViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { PostLikeDetailsViewModel } from '../api/models/PostLikeDetailsViewModel';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostFromDB } from './types/PostFromDB';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async findPosts(dto: FindPostsQueryModel, userId: string | null): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const { count } = (await this.dataSource.query(`SELECT count(*) FROM public."Posts" WHERE "isBanned" = false`))[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundPosts: Post[] = (
      await this.dataSource.query(
        `SELECT * FROM public."Posts"
                WHERE "isBanned" = false
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
      )
    ).map((p) => Post.createPostFromDB(p));

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
    const postFromDB: PostFromDB = (
      await this.dataSource.query(`SELECT * FROM public."Posts" WHERE "id" = $1 AND "isBanned" = false`, [postId])
    )[0];

    if (!postFromDB) return null;
    const foundPost = Post.createPostFromDB(postFromDB);

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

    const { count } = (
      await this.dataSource.query(
        `SELECT count(*)
            FROM public."Posts"
            WHERE "blogId" = $1 AND "isBanned" = false`,
        [blogId],
      )
    )[0];

    const totalCount = +count;
    if (!totalCount) throw new NotFoundException('blog not found');

    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundPosts: Post[] = (
      await this.dataSource.query(
        `SELECT * FROM public."Posts"
            WHERE "blogId" = $1 AND "isBanned" = false
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
        [blogId],
      )
    ).map((p) => Post.createPostFromDB(p));

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
