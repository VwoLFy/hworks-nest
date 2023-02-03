import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { HTTP_Status } from '../../../main/types/enums';
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
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../posts/application/dto/UpdatePostDto';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post-use-case';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { BlogViewModelBlogger } from './models/BlogViewModelBlogger';

@Controller('blogger/blogs')
@UseGuards(JwtAuthGuard)
export class BloggerBlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected postsQueryRepo: PostsQueryRepo,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async findOwnBlogs(
    @Query(findBlogsQueryPipe) query: FindBlogsQueryModel,
    @UserId() userId: string,
  ): Promise<PageViewModel<BlogViewModelBlogger>> {
    return await this.blogsQueryRepo.findOwnBlogs(userId, query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto, @UserId() userId: string): Promise<BlogViewModelBlogger> {
    const createdBlogId = await this.commandBus.execute(new CreateBlogCommand(userId, body));
    return await this.blogsQueryRepo.findBlogForBlogger(createdBlogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id', checkObjectIdPipe) blogId: string,
    @Body() body: UpdateBlogDto,
    @UserId() userId: string,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(blogId, userId, body));
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id', checkObjectIdPipe) blogId: string, @UserId() userId: string) {
    const isDeletedBlog = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (!isDeletedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }

  @Post(':id/posts')
  async createBlogPost(
    @Param('id', checkObjectIdPipe) blogId: string,
    @Body() body: BlogPostInputModel,
    @UserId() userId: string,
  ): Promise<PostViewModel> {
    const createdPostId = await this.commandBus.execute(new CreatePostCommand({ ...body, blogId }));
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlogPost(
    @Param('id', checkObjectIdPipe) postId: string,
    @Body() body: UpdatePostDto,
    @UserId() userId: string,
  ) {
    const isUpdatedPost = await this.commandBus.execute(new UpdatePostCommand(postId, body));
    if (!isUpdatedPost) {
      throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogPost(@Param('id', checkObjectIdPipe) postId: string, @UserId() userId: string) {
    const isDeletedPost = await this.commandBus.execute(new DeletePostCommand(postId));
    if (!isDeletedPost) throw new HttpException('post not found', HTTP_Status.NOT_FOUND_404);
  }
}
