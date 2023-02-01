import { PostsQueryRepo } from '../infrastructure/posts.queryRepo';
import { LikePostCommand } from '../application/use-cases/like-post-use-case';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments.queryRepo';
import { FindPostsQueryModel } from './models/FindPostsQueryModel';
import { PostsViewModelPage } from './models/PostsViewModelPage';
import { PostViewModel } from './models/PostViewModel';
import { HTTP_Status } from '../../../main/types/enums';
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
import { PostLikeInputModel } from './models/PostLikeInputModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findPostsQueryPipe } from './models/FindPostsQueryPipe';
import { findCommentsQueryPipe } from '../../comments/api/models/FindCommentsQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post-use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';
import { CommandBus } from '@nestjs/cqrs';

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
  ): Promise<PostsViewModelPage> {
    return await this.postsQueryRepo.findPosts(query, userId);
  }

  @Get(':id')
  @UseGuards(GetUserIdGuard)
  async findPostById(
    @Param('id', checkObjectIdPipe) postId: string,
    @UserId() userId: string | null,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostDto, @UserId() userId: string | null): Promise<PostViewModel> {
    const createdPostId = await this.commandBus.execute(new CreatePostCommand(body));
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(@Param('id', checkObjectIdPipe) postId: string, @Body() body: UpdatePostDto) {
    const isUpdatedPost = await this.commandBus.execute(new UpdatePostCommand(postId, body));
    if (!isUpdatedPost) {
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
    }
  }

  @Get(':id/comments')
  @UseGuards(GetUserIdGuard)
  async findCommentsByPostId(
    @Param('id', checkObjectIdPipe) postId: string,
    @Query(findCommentsQueryPipe) query: FindCommentsQueryModel,
    @UserId() userId: string | null,
  ): Promise<CommentViewModelPage> {
    const foundComments = await this.commentsQueryRepo.findCommentsByPostId({ postId, ...query, userId });
    if (!foundComments) throw new HttpException('comments not found', HTTP_Status.NOT_FOUND_404);

    return foundComments;
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('id', checkObjectIdPipe) postId: string,
    @Body() body: CommentInputModel,
    @UserId() userId: string | null,
  ): Promise<CommentViewModel> {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand({ postId, content: body.content, userId }),
    );
    if (!createdCommentId) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);

    const createdComment = await this.commentsQueryRepo.findCommentById(createdCommentId, userId);
    if (createdComment) return createdComment;
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async likePost(
    @Param('id', checkObjectIdPipe) postId: string,
    @Body() body: PostLikeInputModel,
    @UserId() userId: string | null,
  ) {
    const result = await this.commandBus.execute(new LikePostCommand({ postId, userId, likeStatus: body.likeStatus }));
    if (!result) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id', checkObjectIdPipe) postId: string) {
    const isDeletedPost = await this.commandBus.execute(new DeletePostCommand(postId));
    if (!isDeletedPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }
}
