import { Comment } from '../domain/comment.schema';
import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindCommentsForOwnBlogsDto } from './dto/FindCommentsForOwnBlogsDto';
import { CommentViewModelBl } from '../api/models/CommentViewModel.Bl';
import { Post } from '../../posts/domain/post.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentFromDB } from './dto/CommentFromDB';

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

    const foundPosts: Post[] = (
      await this.dataSource.query(
        `SELECT po.*
            FROM public."Blogs" b
            LEFT JOIN public."Posts" po
            ON b.id = po."blogId"
            WHERE b."userId" = $1`,
        [userId],
      )
    ).map((p) => Post.createPostFromDB(p));
    const postIds = foundPosts.map((p) => p.id);

    const { count } = (
      await this.dataSource.query(
        `SELECT count(*) 
              FROM public."Comments"
              WHERE "postId" = ANY($1)`,
        [postIds],
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
             WHERE "postId" = ANY($3)
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, LikeStatus.None, postIds],
    );

    const items = await Promise.all(commentsFromDB.map((c) => this.getCommentViewModelBl(c, foundPosts)));

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
    const comment = Comment.createCommentFromDB(commentFromDB);
    const myStatus = commentFromDB.myStatus;

    return new CommentViewModel(comment, myStatus);
  }

  private async getCommentViewModelBl(commentFromDB: CommentFromDB, posts: Post[]): Promise<CommentViewModelBl> {
    const comment = Comment.createCommentFromDB(commentFromDB);
    const myStatus = commentFromDB.myStatus;

    const post = posts.find((p) => p.id === comment.postId);
    return new CommentViewModelBl(comment, post, myStatus);
  }
}
