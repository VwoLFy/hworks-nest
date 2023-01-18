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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentViewModel } from '../../comments/api/models/CommentViewModel';
import { CommentInputModel } from '../../comments/api/models/CommentInputModel';
import { CommentsService } from '../../comments/application/comments-service';
import { PostLikeInputModel } from './models/PostLikeInputModel';
import { AuthGuard } from '../../auth.guard';
import { paramForMongoDB } from '../../main/ParamForMongoDB';
import { findPostsQueryPipe } from './models/FindPostsQueryPipe';
import { findCommentsQueryPipe } from '../../comments/api/models/FindCommentsQueryPipe';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsQueryRepo: PostsQueryRepo,
    protected postsService: PostsService,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected commentsService: CommentsService,
  ) {}

  @Get()
  async getPosts(
    @Query(findPostsQueryPipe) query: FindPostsQueryModel,
    @Req() req: Request,
  ): Promise<PostsViewModelPage> {
    const userId = req.userId ? req.userId : null;
    return await this.postsQueryRepo.findPosts(query, userId);
  }

  @Get(':id')
  async getPost(@Param('id', paramForMongoDB) postId, @Req() req: Request): Promise<PostViewModel> {
    const userId = req.userId ? req.userId : null;
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() body: CreatePostDto, @Req() req: Request): Promise<PostViewModel> {
    const userId = req.userId ? req.userId : null;
    const createdPostId = await this.postsService.createPost(body);
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(@Param('id', paramForMongoDB) postId, @Body() body: UpdatePostDto) {
    const isUpdatedPost = await this.postsService.updatePost(postId, body);
    if (!isUpdatedPost) {
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
    }
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id', paramForMongoDB) postId,
    @Query(findCommentsQueryPipe) query: FindCommentsQueryModel,
    @Req() req: Request,
  ): Promise<CommentViewModelPage> {
    const userId = req.userId ? req.userId : null;
    const foundComments = await this.commentsQueryRepo.findCommentsByPostId({ postId, ...query, userId });
    if (!foundComments) throw new HttpException('comments not found', HTTP_Status.NOT_FOUND_404);

    return foundComments;
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  async createCommentForPost(
    @Param('id', paramForMongoDB) postId,
    @Body() body: CommentInputModel,
    @Req() req: Request,
  ): Promise<CommentViewModel> {
    const userId = req.userId;
    const createdCommentId = await this.commentsService.createComment({ postId, content: body.content, userId });
    if (!createdCommentId) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    const createdComment = await this.commentsQueryRepo.findCommentById(createdCommentId, userId);
    if (createdComment) return createdComment;
  }

  @Put(':id/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async likePost(@Param('id', paramForMongoDB) postId, @Body() body: PostLikeInputModel, @Req() req: Request) {
    const result = await this.postsService.likePost({
      postId,
      userId: req.userId,
      likeStatus: body.likeStatus,
    });
    if (!result) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id', paramForMongoDB) postId) {
    const isDeletedPost = await this.postsService.deletePost(postId);
    if (!isDeletedPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }
}
