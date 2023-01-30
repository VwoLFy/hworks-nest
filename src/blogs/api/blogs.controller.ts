import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { DeleteBlogUseCase } from '../application/use-cases/delete-blog-use-case';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { BlogViewModel } from './models/BlogViewModel';
import { HTTP_Status } from '../../main/types/enums';
import { PostsViewModelPage } from '../../posts/api/models/PostsViewModelPage';
import { BlogPostInputModel } from './models/BlogPostInputModel';
import { PostViewModel } from '../../posts/api/models/PostViewModel';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { FindPostsQueryModel } from '../../posts/api/models/FindPostsQueryModel';
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
import { BlogsViewModelPage } from './models/BlogsViewModelPage';
import { checkObjectIdPipe } from '../../main/checkObjectIdPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { findPostsOfBlogQueryPipe } from './models/FindPostsOfBlogQueryPipe';
import { UserId } from '../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../main/guards/get-user-id.guard';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { CreateBlogUseCase } from '../application/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from '../application/use-cases/update-blog-use-case';
import { CreatePostUseCase } from '../../posts/application/use-cases/create-post-use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected postsQueryRepo: PostsQueryRepo,
    private createBlogUseCase: CreateBlogUseCase,
    private updateBlogUseCase: UpdateBlogUseCase,
    private deleteBlogUseCase: DeleteBlogUseCase,
    private createPostUseCase: CreatePostUseCase,
  ) {}

  @Get()
  async findBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<BlogsViewModelPage> {
    return await this.blogsQueryRepo.findBlogs(query);
  }

  @Get(':id')
  async findBlogById(@Param('id', checkObjectIdPipe) blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!blog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
    return blog;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewModel> {
    const createdBlogId = await this.createBlogUseCase.execute(body);
    return await this.blogsQueryRepo.findBlogById(createdBlogId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', checkObjectIdPipe) blogId: string, @Body() body: UpdateBlogDto) {
    const isUpdatedBlog = await this.updateBlogUseCase.execute(blogId, body);
    if (!isUpdatedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }

  @Get(':id/posts')
  @UseGuards(GetUserIdGuard)
  async findPostsByBlogId(
    @Param('id', checkObjectIdPipe) blogId: string,
    @Query(findPostsOfBlogQueryPipe) query: FindPostsQueryModel,
    @UserId() userId: string | null,
  ): Promise<PostsViewModelPage> {
    const foundPost = await this.postsQueryRepo.findPostsByBlogId(blogId, userId, query);
    if (!foundPost) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id', checkObjectIdPipe) blogId: string,
    @Body() body: BlogPostInputModel,
    @UserId() userId: string | null,
  ): Promise<PostViewModel> {
    const createdPostId = await this.createPostUseCase.execute({
      ...body,
      blogId,
    });
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', checkObjectIdPipe) blogId: string) {
    const isDeletedBlog = await this.deleteBlogUseCase.execute(blogId);
    if (!isDeletedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
}
