import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { BlogViewModel } from './models/BlogViewModel';
import { FindPostsQueryModel } from '../../posts/api/models/FindPostsQueryModel';
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { findPostsOfBlogQueryPipe } from './models/FindPostsOfBlogQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';
import { PostViewModel } from '../../posts/api/models/PostViewModel';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsQueryRepo: BlogsQueryRepo, protected postsQueryRepo: PostsQueryRepo) {}

  @Get()
  async findBlogs(@Query(findBlogsQueryPipe) query: FindBlogsQueryModel): Promise<PageViewModel<BlogViewModel>> {
    return await this.blogsQueryRepo.findBlogs(query);
  }

  @Get(':blogId')
  async findBlogById(@Param('blogId', checkObjectIdPipe) blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return blog;
  }

  @Get(':blogId/posts')
  @UseGuards(GetUserIdGuard)
  async findPostsForBlog(
    @Param('blogId', checkObjectIdPipe) blogId: string,
    @Query(findPostsOfBlogQueryPipe) query: FindPostsQueryModel,
    @UserId() userId: string | null,
  ): Promise<PageViewModel<PostViewModel>> {
    return await this.postsQueryRepo.findPostsForBlog(blogId, userId, query);
  }
}
