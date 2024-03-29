import { FindPostsQueryModel } from '../api/models/FindPostsQueryModel';
import { PostViewModel } from '../api/models/PostViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { PostLikeDetailsViewModel } from '../api/models/PostLikeDetailsViewModel';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostFromDB } from './types/PostFromDB';
import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/postLike.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectRepository(Post) private readonly postRepositoryT: Repository<Post>,
    @InjectRepository(PostLike) private readonly postLikeRepositoryT: Repository<PostLike>,
  ) {}

  async findPosts(dto: FindPostsQueryModel, userId: string | null): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const totalCount = await this.postRepositoryT.count({
      relations: { blog: true },
      where: { blog: { isBanned: false } },
    });
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const postsFromDB: PostFromDB[] = await this.postRepositoryT.query(
      `SELECT p.*,
             COALESCE((SELECT "likeStatus"
                       FROM public."PostLikes"
                       WHERE "postId" = p."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
             (SELECT count(*)::int
                       FROM public."PostLikes" as pl
                       left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                       WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
             (SELECT count(*)::int
                       FROM public."PostLikes" as pl
                       left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                       WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
             FROM public."Posts" p
             left join public."Blogs" as b on b."id" = p."blogId"               
             WHERE b."isBanned" = false
	           ORDER BY p."${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId],
    );

    const items = await Promise.all(postsFromDB.map((p) => this.getPostViewModel(p)));

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
      await this.postRepositoryT.query(
        `SELECT p.*,
               COALESCE((SELECT "likeStatus"
                         FROM public."PostLikes"
                         WHERE "postId" = p."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
               (SELECT count(*)::int
                         FROM public."PostLikes" as pl
                         left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                         WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
               (SELECT count(*)::int
                         FROM public."PostLikes" as pl
                         left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                         WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
               FROM public."Posts" as p
               left join public."Blogs" as b on b."id" = p."blogId"               
               WHERE p."id" = $2 AND b."isBanned" = false`,
        [userId, postId],
      )
    )[0];

    if (!postFromDB) throw new NotFoundException('post not found');
    return this.getPostViewModel(postFromDB);
  }

  async findPostsForBlog(
    blogId: string,
    userId: string | null,
    dto: FindPostsQueryModel,
  ): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const totalCount = await this.postRepositoryT.count({
      relations: { blog: true },
      where: { blog: { isBanned: false }, blogId: blogId },
    });
    if (!totalCount) throw new NotFoundException('blog not found');

    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const postsFromDB: PostFromDB[] = await this.postRepositoryT.query(
      `SELECT p.*,
            COALESCE((SELECT "likeStatus"
                      FROM public."PostLikes"
                      WHERE "postId" = p."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
            (SELECT count(*)::int
                      FROM public."PostLikes" as pl
                      left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                      WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
            (SELECT count(*)::int
                      FROM public."PostLikes" as pl
                      left join public."UsersBanInfo" as b on b."userId" = pl."userId"
                      WHERE pl."postId" = p."id" AND pl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
            FROM public."Posts" p
            left join public."Blogs" as b on b."id" = p."blogId"               
            WHERE p."blogId" = $2 AND b."isBanned" = false
	          ORDER BY p."${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, blogId],
    );

    const items = await Promise.all(postsFromDB.map((p) => this.getPostViewModel(p)));

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

  private async getPostViewModel(postFromDB: PostFromDB): Promise<PostViewModel> {
    const newestLikes = await this.newestLikes(postFromDB.id);
    return new PostViewModel(postFromDB, newestLikes);
  }

  private async newestLikes(postId: string): Promise<PostLikeDetailsViewModel[]> {
    const newestLikes = await this.postLikeRepositoryT.find({
      relations: { user: true },
      where: { postId: postId, likeStatus: LikeStatus.Like, user: { banInfo: { isBanned: false } } },
      order: { addedAt: 'desc' },
      take: 3,
    });

    return newestLikes.map((l) => new PostLikeDetailsViewModel(l));
  }
}
