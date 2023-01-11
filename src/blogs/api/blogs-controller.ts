import { BlogsQueryRepo } from '../infrastructure/blogs-queryRepo';
import { BlogsService } from '../application/blogs-service';
//import { PostsQueryRepo } from '../../posts/infrastructure/posts-queryRepo';
//import { PostsService } from '../../posts/application/posts-service';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { BlogViewModel } from './models/BlogViewModel';
//import { HTTP_Status } from '../../main/types/enums';
//import { PostsViewModelPage } from '../../posts/api/models/PostsViewModelPage';
//import { BlogPostInputModel } from './models/BlogPostInputModel';
//import { PostViewModel } from '../../posts/api/models/PostViewModel';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
//import { FindPostsQueryModel } from '../../posts/api/models/FindPostsQueryModel';
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
import { HTTP_Status } from '../../main/types/enums';
import { BlogsViewModelPage } from './models/BlogsViewModelPage';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepo: BlogsQueryRepo,
    protected blogsService: BlogsService, //protected postsQueryRepo: PostsQueryRepo, //protected postsService: PostsService,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: FindBlogsQueryModel,
  ): Promise<BlogsViewModelPage> {
    return await this.blogsQueryRepo.findBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogID): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogID);
    if (!blog)
      throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
    return blog;
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewModel> {
    const createdBlogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepo.findBlogById(createdBlogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') blogID, @Body() body: UpdateBlogDto) {
    const isUpdatedBlog = await this.blogsService.updateBlog(blogID, body);
    if (!isUpdatedBlog)
      throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
  /*

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') blogID,
    @Query() query: FindPostsQueryModel,
  ): Promise<PostsViewModelPage> {
    return await this.postsQueryRepo.findPostsByBlogId(blogID, {
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    });
  }

  @Post(':id/posts')
  async createPostForBlog(
    @Param('id') blogID,
    @Body() body: BlogPostInputModel,
  ): Promise<PostViewModel> {
    const createdPostId = await this.postsService.createPost({
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: blogID,
    });
    if (!createdPostId) {
      return HTTP_Status.NOT_FOUND_404;
    } else {
      return await this.postsQueryRepo.findPostById(createdPostId);
    }
  }
*/

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogID) {
    const isDeletedBlog = await this.blogsService.deleteBlog(blogID);
    if (!isDeletedBlog)
      throw new HttpException('blog not found', HTTP_Status.NOT_FOUND_404);
  }
}
