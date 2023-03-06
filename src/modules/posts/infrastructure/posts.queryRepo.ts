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

    const totalCount = await this.postRepositoryT.count({ where: { isBanned: false } });
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const postsFromDB: PostFromDB[] = await this.postRepositoryT.query(
      `SELECT *,
             COALESCE((SELECT "likeStatus"
                       FROM public."PostLikes"
                       WHERE "postId" = p."id" AND "userId" = $1), 'None') as "myStatus"
             FROM public."Posts" p
             WHERE "isBanned" = false
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId],
    );

    // const postsFromDB: PostFromDB[] = await this.postRepositoryT
    //   .createQueryBuilder('p')
    //   .addSelect(
    //     `COALESCE((SELECT "likeStatus" FROM public."PostLikes" WHERE "postId" = p.id AND "userId" = :userId), 'None')`,
    //     'myStatus',
    //   )
    //   .andWhere('p."isBanned" = false')
    //   .setParameter('userId', userId)
    //   .orderBy(`"${sortBy}"`, sortDirection === SortDirection.asc ? 'ASC' : 'DESC')
    //   .limit(pageSize)
    //   .offset(offset)
    //   .getRawMany();

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
        `SELECT *,
               COALESCE((SELECT "likeStatus"
                         FROM public."PostLikes"
                         WHERE "postId" = p."id" AND "userId" = $1), 'None') as "myStatus"
               FROM public."Posts" as p
               WHERE "id" = $2 AND "isBanned" = false`,
        [userId, postId],
      )
    )[0];

    if (!postFromDB) return null;
    return this.getPostViewModel(postFromDB);
  }

  async findPostsForBlog(
    blogId: string,
    userId: string | null,
    dto: FindPostsQueryModel,
  ): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const totalCount = await this.postRepositoryT.count({ where: { isBanned: false, blogId: blogId } });
    if (!totalCount) throw new NotFoundException('blog not found');

    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const postsFromDB: PostFromDB[] = await this.postRepositoryT.query(
      `SELECT *,
            COALESCE((SELECT "likeStatus"
                      FROM public."PostLikes"
                      WHERE "postId" = p."id" AND "userId" = $1), 'None') as "myStatus"
            FROM public."Posts" p
            WHERE "blogId" = $2 AND "isBanned" = false
	          ORDER BY "${sortBy}" ${sortDirection}
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
    const myStatus = postFromDB.myStatus;
    const newestLikes = await this.newestLikes(postFromDB.id);

    return new PostViewModel(postFromDB, myStatus, newestLikes);
  }

  private async newestLikes(postId: string): Promise<PostLikeDetailsViewModel[]> {
    const newestLikes = await this.postLikeRepositoryT.find({
      where: { postId: postId, likeStatus: LikeStatus.Like, isBanned: false },
      order: { addedAt: 'desc' },
      take: 3,
    });

    return newestLikes.map((l) => new PostLikeDetailsViewModel(l));
  }
}
