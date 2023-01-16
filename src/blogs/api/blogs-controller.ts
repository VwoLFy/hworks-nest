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
import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Put, Query } from '@nestjs/common';
import { BlogsViewModelPage } from './models/BlogsViewModelPage';
import { ParamForMongoDB } from '../../main/ParamForMongoDB';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected blogsService: BlogsService,
    protected postsQueryRepo: PostsQueryRepo,
    protected postsService: PostsService,
  ) {}

  @Get()
  async getBlogs(@Query() query: FindBlogsQueryModel): Promise<BlogsViewModelPage> {
    return await this.blogsQueryRepo.findBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id', new ParamForMongoDB()) blogId): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!blog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
    return blog;
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewModel> {
    const createdBlogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepo.findBlogById(createdBlogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id', new ParamForMongoDB()) blogId, @Body() body: UpdateBlogDto) {
    const isUpdatedBlog = await this.blogsService.updateBlog(blogId, body);
    console.log(isUpdatedBlog);
    if (!isUpdatedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id', new ParamForMongoDB()) blogId,
    @Query() query: FindPostsQueryModel,
  ): Promise<PostsViewModelPage> {
    const userId = null;
    const foundPost = await this.postsQueryRepo.findPostsByBlogId(blogId, userId, query);
    if (!foundPost) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return foundPost;
  }

  @Post(':id/posts')
  async createPostForBlog(
    @Param('id', new ParamForMongoDB()) blogId,
    @Body() body: BlogPostInputModel,
  ): Promise<PostViewModel> {
    const userId = null;
    const createdPostId = await this.postsService.createPost({
      ...body,
      blogId,
    });
    if (!createdPostId) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);

    return await this.postsQueryRepo.findPostById(createdPostId, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id', new ParamForMongoDB()) blogId) {
    const isDeletedBlog = await this.blogsService.deleteBlog(blogId);
    if (!isDeletedBlog) throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
}
