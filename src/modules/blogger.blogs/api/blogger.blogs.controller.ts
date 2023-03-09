import { BlogsQueryRepo } from '../../blogs/infrastructure/blogs.queryRepo';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from '../../public.blogs/api/models/FindBlogsQueryModel';
import { BlogPostInputModel } from './models/BlogPostInputModel';
import { PostViewModel } from '../../posts/api/models/PostViewModel';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { findBlogsQueryPipe } from '../../public.blogs/api/models/FindBlogsQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostCommand } from '../application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post-use-case';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { BlogViewModel } from '../../public.blogs/api/models/BlogViewModel';
import { findCommentsQueryPipe } from '../../posts/api/models/FindCommentsQueryPipe';
import { FindCommentsQueryModel } from '../../posts/api/models/FindCommentsQueryModel';
import { CommentViewModelBl } from './models/CommentViewModel.Bl';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments.queryRepo';
import { PostUpdateModel } from './models/PostUpdateModel';

@Controller('blogger/blogs')
@UseGuards(JwtAuthGuard)
export class BloggerBlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected postsQueryRepo: PostsQueryRepo,
    protected commentsQueryRepo: CommentsQueryRepo,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async findOwnBlogs(
    @Query(findBlogsQueryPipe) query: FindBlogsQueryModel,
    @UserId() userId: string,
  ): Promise<PageViewModel<BlogViewModel>> {
    return await this.blogsQueryRepo.findOwnBlogs(userId, query);
  }

  @Get('comments')
  async findCommentsForOwnBlogs(
    @Query(findCommentsQueryPipe) query: FindCommentsQueryModel,
    @UserId() userId: string,
  ): Promise<PageViewModel<CommentViewModelBl>> {
    return await this.commentsQueryRepo.findCommentsForOwnBlogs({ ...query, userId });
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto, @UserId() userId: string): Promise<BlogViewModel> {
    const createdBlogId = await this.commandBus.execute(new CreateBlogCommand(userId, body));
    return await this.blogsQueryRepo.findBlogById(createdBlogId);
  }

  @Put(':blogId')
  @HttpCode(204)
  async updateBlog(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Body() body: UpdateBlogDto,
    @UserId() userId: string,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(userId, blogId, body));
  }

  @Delete(':blogId')
  @HttpCode(204)
  async deleteBlog(@Param('blogId', ParseUUIDPipe) blogId: string, @UserId() userId: string) {
    await this.commandBus.execute(new DeleteBlogCommand(userId, blogId));
  }

  @Post(':blogId/posts')
  async createBlogPost(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Body() body: BlogPostInputModel,
    @UserId() userId: string,
  ): Promise<PostViewModel> {
    const createdPostId = await this.commandBus.execute(new CreatePostCommand(userId, { ...body, blogId }));

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updateBlogPost(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() body: PostUpdateModel,
    @UserId() userId: string,
  ) {
    await this.commandBus.execute(new UpdatePostCommand(userId, postId, blogId, body));
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deleteBlogPost(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @UserId() userId: string,
  ) {
    await this.commandBus.execute(new DeletePostCommand(userId, postId, blogId));
  }
}
