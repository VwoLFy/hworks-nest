import { BlogsQueryRepo } from '../infrastructure/blogs.queryRepo';
import { PostsQueryRepo } from '../../posts/infrastructure/posts.queryRepo';
import { FindBlogsQueryModel } from './models/FindBlogsQueryModel';
import { BlogViewModel } from './models/BlogViewModel';
import { HTTP_Status } from '../../../main/types/enums';
import { PostsViewModelPage } from '../../posts/api/models/PostsViewModelPage';
import { FindPostsQueryModel } from '../../posts/api/models/FindPostsQueryModel';
import { Controller, Get, HttpException, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { findBlogsQueryPipe } from './models/FindBlogsQueryPipe';
import { findPostsOfBlogQueryPipe } from './models/FindPostsOfBlogQueryPipe';
import { UserId } from '../../../main/decorators/user.decorator';
import { GetUserIdGuard } from '../../../main/guards/get-user-id.guard';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsQueryRepo: BlogsQueryRepo, protected postsQueryRepo: PostsQueryRepo) {}

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
}
