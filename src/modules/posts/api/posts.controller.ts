import { PostsQueryRepo } from '../infrastructure/posts.queryRepo';
import { LikePostCommand } from '../application/use-cases/like-post-use-case';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments.queryRepo';
import { FindPostsQueryModel } from './models/FindPostsQueryModel';
import { PostViewModel } from './models/PostViewModel';
import { HTTP_Status } from '../../../main/types/enums';
import { FindCommentsQueryModel } from './models/FindCommentsQueryModel';
import { Body, Controller, Get, HttpCode, HttpException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommentViewModel } from '../../comments/api/models/CommentViewModel';
import { CommentInputModel } from '../../comments/api/models/CommentInputModel';
import { PostLikeInputModel } from './models/PostLikeInputModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findPostsQueryPipe } from './models/FindPostsQueryPipe';
import { findCommentsQueryPipe } from '../../comments/api/models/FindCommentsQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { PageViewModel } from '../../../main/types/PageViewModel';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsQueryRepo: PostsQueryRepo,
    protected commentsQueryRepo: CommentsQueryRepo,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(GetUserIdGuard)
  async findPosts(
    @Query(findPostsQueryPipe) query: FindPostsQueryModel,
    @UserId() userId: string | null,
  ): Promise<PageViewModel<PostViewModel>> {
    return await this.postsQueryRepo.findPosts(query, userId);
  }

  @Get(':postId')
  @UseGuards(GetUserIdGuard)
  async findPostById(
    @Param('postId', checkObjectIdPipe) postId: string,
    @UserId() userId: string | null,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Get(':postId/comments')
  @UseGuards(GetUserIdGuard)
  async findCommentsByPostId(
    @Param('postId', checkObjectIdPipe) postId: string,
    @Query(findCommentsQueryPipe) query: FindCommentsQueryModel,
    @UserId() userId: string | null,
  ): Promise<PageViewModel<CommentViewModel>> {
    const foundComments = await this.commentsQueryRepo.findCommentsByPostId({ postId, ...query, userId });
    if (!foundComments) throw new HttpException('comments not found', HTTP_Status.NOT_FOUND_404);

    return foundComments;
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('postId', checkObjectIdPipe) postId: string,
    @Body() body: CommentInputModel,
    @UserId() userId: string,
  ): Promise<CommentViewModel> {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand({ postId, content: body.content, userId }),
    );

    return this.commentsQueryRepo.findCommentById(createdCommentId, userId);
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async likePost(
    @Param('postId', checkObjectIdPipe) postId: string,
    @Body() body: PostLikeInputModel,
    @UserId() userId: string,
  ) {
    await this.commandBus.execute(new LikePostCommand({ postId, userId, likeStatus: body.likeStatus }));
  }
}
