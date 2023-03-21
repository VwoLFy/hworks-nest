import { FindCommentsByPostIdDto } from './dto/FindCommentsByPostIdDto';
import { CommentViewModel } from '../api/models/CommentViewModel';
import { LikeStatus } from '../../../main/types/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindCommentsForOwnBlogsDto } from './dto/FindCommentsForOwnBlogsDto';
import { CommentViewModelBl } from '../../blogger.blogs/api/models/CommentViewModel.Bl';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentFromDB } from './dto/CommentFromDB';
import { PostFromDB } from '../../posts/infrastructure/types/PostFromDB';
import { Comment } from '../domain/comment.entity';
import { Post } from '../../posts/domain/post.entity';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectRepository(Comment) private readonly commentRepositoryT: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepositoryT: Repository<Post>,
  ) {}

  async findCommentById(commentId: string, userId: string | null): Promise<CommentViewModel | null> {
    const commentFromDB: CommentFromDB = (
      await this.commentRepositoryT.query(
        `SELECT *,
               COALESCE((SELECT "likeStatus"
                        FROM public."CommentLikes"
                        WHERE "commentId" = c."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
               FROM public."Comments" as c
               left join public."UsersBanInfo" as b on b."userId" = c."userId"               
               WHERE "id" = $2 AND b."isBanned" = false`,
        [userId, commentId],
      )
    )[0];
    if (!commentFromDB) throw new NotFoundException('comment not found');
    return new CommentViewModel(commentFromDB);
  }

  async findCommentsByPostId(dto: FindCommentsByPostIdDto): Promise<PageViewModel<CommentViewModel> | null> {
    const { postId, pageNumber, pageSize, sortBy, sortDirection, userId } = dto;

    const totalCount = await this.commentRepositoryT.count({
      where: { postId: postId, user: { banInfo: { isBanned: false } } },
    });
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const commentsFromDB: CommentFromDB[] = await this.commentRepositoryT.query(
      `SELECT *,
               COALESCE((SELECT "likeStatus"
                        FROM public."CommentLikes"
                        WHERE "commentId" = c."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
             FROM public."Comments" as c
             left join public."UsersBanInfo" as b on b."userId" = c."userId"
             WHERE "postId" = $2 AND b."isBanned" = false
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId, postId],
    );

    const items = commentsFromDB.map((c) => new CommentViewModel(c));

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

    const postsFromDB: PostFromDB[] = await this.postRepositoryT.query(
      `SELECT po.* FROM public."Blogs" b
            LEFT JOIN public."Posts" po ON b.id = po."blogId"
            WHERE b."userId" = $1`,
      [userId],
    );

    const { count } = (
      await this.commentRepositoryT.query(
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

    const commentsFromDB: CommentFromDB[] = await this.commentRepositoryT.query(
      `SELECT *,
               COALESCE((SELECT "likeStatus"
                        FROM public."CommentLikes"
                        WHERE "commentId" = c."id" AND "userId" = $1), '${LikeStatus.None}') as "myStatus",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Like}' AND b."isBanned" = false) as "likesCount",
               (SELECT count(*)::int
                        FROM public."CommentLikes" as cl
                        left join public."UsersBanInfo" as b on b."userId" = cl."userId"
                        WHERE cl."commentId" = c."id" AND cl."likeStatus" = '${LikeStatus.Dislike}' AND b."isBanned" = false) as "dislikesCount"
             FROM public."Comments" as c
             WHERE "postId" IN 
                        (SELECT po.id FROM public."Blogs" b
                        LEFT JOIN public."Posts" po ON b.id = po."blogId"
                        WHERE b."userId" = $1)
	           ORDER BY "${sortBy}" ${sortDirection}
	           LIMIT ${pageSize} OFFSET ${offset};`,
      [userId],
    );

    const items = commentsFromDB.map((c) => this.getCommentViewModelBl(c, postsFromDB));

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

  private getCommentViewModelBl(commentFromDB: CommentFromDB, postsFromDB: PostFromDB[]): CommentViewModelBl {
    const post = postsFromDB.find((p) => p.id === commentFromDB.postId);
    return new CommentViewModelBl(commentFromDB, post);
  }
}
