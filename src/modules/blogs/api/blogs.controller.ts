import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { BlogViewModel } from './models/BlogViewModel';
import { HTTP_Status } from '../../../main/types/enums';
import { PostsViewModelPage } from '../../posts/api/models/PostsViewModelPage';
import { BlogPostInputModel } from './models/BlogPostInputModel';
import { PostViewModel } from '../../posts/api/models/PostViewModel';
import { FindPostsQueryModel } from '../../posts/api/models/FindPostsQueryModel';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { findPostsOfBlogQueryPipe } from './models/FindPostsOfBlogQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected postsQueryRepo: PostsQueryRepo,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async findBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    return await this.blogsQueryRepo.findBlogsPublic(query);
  }

  @Get(':id')
  async findBlogById(@Param('id', checkObjectIdPipe) blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return blog;
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
    const createdPostId = await this.commandBus.execute(new CreatePostCommand({ ...body, blogId }));
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', checkObjectIdPipe) blogId: string) {
    const isDeletedBlog = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (!isDeletedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
}
