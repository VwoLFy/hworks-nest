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
} from '@nestjs/common';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsQueryRepo: PostsQueryRepo,
    protected postsService: PostsService,
    protected commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
  async getPosts(
    @Query() query: FindPostsQueryModel,
  ): Promise<PostsViewModelPage> {
    const userId = null;
    return await this.postsQueryRepo.findPosts(query, userId);
  }

  @Get(':id')
  async getPost(@Param('id') postId): Promise<PostViewModel> {
    const userId = null;
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundPost)
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post()
  async createPost(@Body() body: CreatePostDto): Promise<PostViewModel> {
    const userId = null;
    const createdPostId = await this.postsService.createPost(body);
    if (!createdPostId)
      throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param('id') postId, @Body() body: UpdatePostDto) {
    const isUpdatedPost = await this.postsService.updatePost(postId, body);
    if (!isUpdatedPost) {
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
    }
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id') postId,
    @Query() query: FindCommentsQueryModel,
  ): Promise<CommentViewModelPage> {
    const userId = null;
    const foundComments = await this.commentsQueryRepo.findCommentsByPostId({
      postId,
      page: query.pageNumber,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
      userId,
    });
    if (!foundComments)
      throw new HttpException('comments not found', HTTP_Status.NOT_FOUND_404);

    return foundComments;
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') postId) {
    const isDeletedPost = await this.postsService.deletePost(postId);
    if (!isDeletedPost)
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }
}
