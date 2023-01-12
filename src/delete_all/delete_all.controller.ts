import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsService } from '../blogs/application/blogs-service';
import { PostsService } from '../posts/application/posts-service';
import { UsersService } from '../users/application/user-service';

@Controller('/testing/all-data')
export class DeleteAllController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected usersService: UsersService,
  ) {}

  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.blogsService.deleteAll();
    await this.postsService.deleteAll();
    await this.usersService.deleteAll();
  }
}
