import { PostsQueryRepo } from '../infrastructure/posts-queryRepo';
import { PostsService } from '../application/posts-service';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments-queryRepo';
import { FindPostsQueryModel } from './models/FindPostsQueryModel';
import { PostsViewModelPage } from './models/PostsViewModelPage';
import { PostViewModel } from './models/PostViewModel';
import { HTTP_Status } from '../../main/types/enums';
import { CommentViewModelPage } from '../../comments/api/models/CommentViewModelPage';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { FindCommentsQueryModel } from './models/FindCommentsQueryModel';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentViewModel } from '../../comments/api/models/CommentViewModel';
import { CommentInputModel } from '../../comments/api/models/CommentInputModel';
import { CommentsService } from '../../comments/application/comments-service';
import { PostLikeInputModel } from './models/PostLikeInputModel';
import { AuthGuard } from '../../main/auth.guard';
import { paramForMongoDBPipe } from '../../main/paramForMongoDBPipe';
import { findPostsQueryPipe } from './models/FindPostsQueryPipe';
import { findCommentsQueryPipe } from '../../comments/api/models/FindCommentsQueryPipe';
import { UserId } from '../../main/Decorators/user.decorator';
import { GetUserIdGuard } from '../../main/getUserId.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsQueryRepo: PostsQueryRepo,
    protected postsService: PostsService,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected commentsService: CommentsService,
  ) {}

  @Get()
  @UseGuards(GetUserIdGuard)
  async getPosts(@Query(findPostsQueryPipe) query: FindPostsQueryModel, @UserId() userId): Promise<PostsViewModelPage> {
    return await this.postsQueryRepo.findPosts(query, userId);
  }

  @Get(':id')
  @UseGuards(GetUserIdGuard)
  async getPost(@Param('id', paramForMongoDBPipe) postId, @UserId() userId): Promise<PostViewModel> {
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() body: CreatePostDto, @UserId() userId): Promise<PostViewModel> {
    const createdPostId = await this.postsService.createPost(body);
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(@Param('id', paramForMongoDBPipe) postId, @Body() body: UpdatePostDto) {
    const isUpdatedPost = await this.postsService.updatePost(postId, body);
    if (!isUpdatedPost) {
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
    }
  }

  @Get(':id/comments')
  @UseGuards(GetUserIdGuard)
  async getCommentsForPost(
    @Param('id', paramForMongoDBPipe) postId,
    @Query(findCommentsQueryPipe) query: FindCommentsQueryModel,
    @UserId() userId,
  ): Promise<CommentViewModelPage> {
    const foundComments = await this.commentsQueryRepo.findCommentsByPostId({ postId, ...query, userId });
    if (!foundComments) throw new HttpException('comments not found', HTTP_Status.NOT_FOUND_404);

    return foundComments;
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  async createCommentForPost(
    @Param('id', paramForMongoDBPipe) postId,
    @Body() body: CommentInputModel,
    @UserId() userId,
  ): Promise<CommentViewModel> {
    const createdCommentId = await this.commentsService.createComment({ postId, content: body.content, userId });
    if (!createdCommentId) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    const createdComment = await this.commentsQueryRepo.findCommentById(createdCommentId, userId);
    if (createdComment) return createdComment;
  }

  @Put(':id/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async likePost(@Param('id', paramForMongoDBPipe) postId, @Body() body: PostLikeInputModel, @UserId() userId) {
    const result = await this.postsService.likePost({
      postId,
      userId,
      likeStatus: body.likeStatus,
    });
    if (!result) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id', paramForMongoDBPipe) postId) {
    const isDeletedPost = await this.postsService.deletePost(postId);
    if (!isDeletedPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }
}
