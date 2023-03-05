import { FindPostsQueryModel } from '../api/models/FindPostsQueryModel';
import { PostViewModel } from '../api/models/PostViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { PostLikeDetailsViewModel } from '../api/models/PostLikeDetailsViewModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostFromDB } from './types/PostFromDB';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private readonly postRepositoryT: Repository<Post>,
  ) {}

  async findPosts(dto: FindPostsQueryModel, userId: string | null): Promise<PageViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const { count } = (await this.dataSource.query(`SELECT count(*) FROM public."Posts" WHERE "isBanned" = false`))[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const postsFromDB: PostFromDB[] = await this.dataSource.query(
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
    const foundPost = await this.postRepositoryT.findOne({
      where: { id: postId, isBanned: false },
    });
    const postFromDB: PostFromDB = (
      await this.dataSource.query(
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

    const postsFromDB: PostFromDB[] = await this.dataSource.query(
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
    const newestLikes = await this.dataSource.query(
      `SELECT "addedAt", "userId", "login" FROM public."PostLikes" 
              WHERE "postId" = $1 AND "likeStatus" = $2 AND "isBanned" = $3
              ORDER BY "addedAt" desc
              LIMIT 3`,
      [postId, LikeStatus.Like, false],
    );

    return newestLikes.map((l) => new PostLikeDetailsViewModel(l));
  }
}
