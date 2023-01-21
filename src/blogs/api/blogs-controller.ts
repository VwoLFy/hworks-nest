import { BlogsQueryRepo } from '../infrastructure/blogs-queryRepo';
import { BlogsService } from '../application/blogs-service';
import { PostsQueryRepo } from '../../posts/infrastructure/posts-queryRepo';
import { PostsService } from '../../posts/application/posts-service';
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsViewModelPage } from './models/BlogsViewModelPage';
import { paramForMongoDBPipe } from '../../main/paramForMongoDBPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { findPostsOfBlogQueryPipe } from './models/FindPostsOfBlogQueryPipe';
import { AuthGuard } from '../../auth.guard';
import { Request } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected blogsService: BlogsService,
    protected postsQueryRepo: PostsQueryRepo,
    protected postsService: PostsService,
  ) {}

  @Get()
  async getBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<BlogsViewModelPage> {
    return await this.blogsQueryRepo.findBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id', paramForMongoDBPipe) blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!blog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
    return blog;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewModel> {
    const createdBlogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepo.findBlogById(createdBlogId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', paramForMongoDBPipe) blogId: string, @Body() body: UpdateBlogDto) {
    const isUpdatedBlog = await this.blogsService.updateBlog(blogId, body);
    if (!isUpdatedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id', paramForMongoDBPipe) blogId: string,
    @Query(findPostsOfBlogQueryPipe) query: FindPostsQueryModel,
    @Req() req: Request,
  ): Promise<PostsViewModelPage> {
    const userId = req.userId ? req.userId : null;
    const foundPost = await this.postsQueryRepo.findPostsByBlogId(blogId, userId, query);
    if (!foundPost) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post(':id/posts')
  @UseGuards(AuthGuard)
  async createPostForBlog(
    @Param('id', paramForMongoDBPipe) blogId: string,
    @Body() body: BlogPostInputModel,
    @Req() req: Request,
  ): Promise<PostViewModel> {
    const userId = req.userId ? req.userId : null;
    const createdPostId = await this.postsService.createPost({
      ...body,
      blogId,
    });
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', paramForMongoDBPipe) blogId: string) {
    const isDeletedBlog = await this.blogsService.deleteBlog(blogId);
    if (!isDeletedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
}
