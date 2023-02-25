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
import { CommentLikeFromDB } from './dto/CommentLikeFromDB';

@Injectable()
export class CommentsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentById(commentId: string, userId: string | null): Promise<CommentViewModel | null> {
    const commentFromDB: CommentFromDB = (
      await this.dataSource.query(
        `SELECT * FROM public."Comments"
            WHERE "id" = $1 AND "isBanned" = false`,
        [commentId],
      )
    )[0];

    if (!commentFromDB) throw new NotFoundException('comment not found');
    const foundComment = Comment.createCommentFromDB(commentFromDB);

    const myStatus = await this.myLikeStatus(commentId, userId);
    return new CommentViewModel(foundComment, myStatus);
  }

  async findCommentsByPostId(dto: FindCommentsByPostIdDto): Promise<PageViewModel<CommentViewModel> | null> {
    const { postId, pageNumber, pageSize, sortBy, sortDirection, userId } = dto;

    const { count } = (
      await this.dataSource.query(`SELECT count(*) FROM public."Comments" WHERE "postId" = $1 AND "isBanned" = false`, [
        postId,
      ])
    )[0];

    const totalCount = +count;

    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundComments: Comment[] = (
      await this.dataSource.query(
        `SELECT * FROM public."Comments"
            WHERE "postId" = $1 AND "isBanned" = false
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
        [postId],
      )
    ).map((c) => Comment.createCommentFromDB(c));

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

    const foundComments: Comment[] = (
      await this.dataSource.query(
        `SELECT * FROM public."Comments"
            WHERE "postId" = ANY($1)
	          ORDER BY "${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
        [postIds],
      )
    ).map((c) => Comment.createCommentFromDB(c));

    const items: CommentViewModelBl[] = [];
    for (const comment of foundComments) {
      const post = foundPosts.find((p) => p.id === comment.postId);
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
      const commentLikeFromDB: CommentLikeFromDB = (
        await this.dataSource.query(`SELECT * FROM public."CommentLikes" WHERE "commentId" = $1 AND "userId" = $2`, [
          commentId,
          userId,
        ])
      )[0];

      if (commentLikeFromDB) myStatus = commentLikeFromDB.likeStatus;
    }
    return myStatus;
  }
}
