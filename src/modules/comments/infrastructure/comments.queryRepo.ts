import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindCommentsForOwnBlogsDto } from './dto/FindCommentsForOwnBlogsDto';
import { CommentViewModelBl } from '../api/models/CommentViewModel.Bl';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentFromDB } from './dto/CommentFromDB';
import { PostFromDB } from '../../posts/infrastructure/types/PostFromDB';

@Injectable()
export class CommentsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentById(commentId: string, userId: string | null): Promise<CommentViewModel | null> {
    const commentFromDB: CommentFromDB = (
      await this.dataSource.query(
        `SELECT *,
               COALESCE((SELECT "likeStatus"
                        FROM public."CommentLikes"
                        WHERE "commentId" = c."id" AND "userId" = $1), $2) as "myStatus"
               FROM public."Comments" as c
               WHERE "id" = $3 AND "isBanned" = false`,
        [userId, LikeStatus.None, commentId],
      )
    )[0];

    if (!commentFromDB) throw new NotFoundException('comment not found');
    return this.getCommentViewModel(commentFromDB);
  }

  async findCommentsByPostId(dto: FindCommentsByPostIdDto): Promise<PageViewModel<CommentViewModel> | null> {
    const { postId, pageNumber, pageSize, sortBy, sortDirection, userId } = dto;

    const { count } = (
      await this.dataSource.query(
        `SELECT count(*)
               FROM public."Comments"
               WHERE "postId" = $1 AND "isBanned" = false`,
        [postId],
      )
    )[0];

    const totalCount = +count;

    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const commentsFromDB: CommentFromDB[] = await this.dataSource.query(
      `SELECT *,
             COALESCE((SELECT "likeStatus"
                      FROM public."CommentLikes"
                      WHERE "commentId" = c."id" AND "userId" = $1), $2) as "myStatus"
             FROM public."Comments" as c
             WHERE "postId" = $3 AND "isBanned" = false
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, LikeStatus.None, postId],
    );

    const items = await Promise.all(commentsFromDB.map((c) => this.getCommentViewModel(c)));

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

    const postsFromDB: PostFromDB[] = await this.dataSource.query(
      `SELECT po.* FROM public."Blogs" b
            LEFT JOIN public."Posts" po ON b.id = po."blogId"
            WHERE b."userId" = $1`,
      [userId],
    );

    const { count } = (
      await this.dataSource.query(
        `SELECT count(*) FROM public."Comments"
              WHERE "postId" IN 
                (SELECT po.id FROM public."Blogs" b
                LEFT JOIN public."Posts" po ON b.id = po."blogId"
                WHERE b."userId" = $1)`,
        [userId],
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);

    const offset = (pageNumber - 1) * pageSize;

    const commentsFromDB: CommentFromDB[] = await this.dataSource.query(
      `SELECT *,
             COALESCE((SELECT "likeStatus" FROM public."CommentLikes"
                        WHERE "commentId" = c."id" AND "userId" = $1), $2) as "myStatus"
             FROM public."Comments" as c
             WHERE "postId" IN 
                        (SELECT po.id FROM public."Blogs" b
                        LEFT JOIN public."Posts" po ON b.id = po."blogId"
                        WHERE b."userId" = $1)
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, LikeStatus.None],
    );

    const items = await Promise.all(commentsFromDB.map((c) => this.getCommentViewModelBl(c, postsFromDB)));

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

  private async getCommentViewModel(commentFromDB: CommentFromDB): Promise<CommentViewModel> {
    const myStatus = commentFromDB.myStatus;

    return new CommentViewModel(commentFromDB, myStatus);
  }

  private async getCommentViewModelBl(
    commentFromDB: CommentFromDB,
    postsFromDB: PostFromDB[],
  ): Promise<CommentViewModelBl> {
    const myStatus = commentFromDB.myStatus;

    const post = postsFromDB.find((p) => p.id === commentFromDB.postId);
    return new CommentViewModelBl(commentFromDB, post, myStatus);
  }
}
