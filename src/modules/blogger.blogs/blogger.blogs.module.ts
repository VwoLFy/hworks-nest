import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './api/blogger.blogs.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { CreateBlogUseCase } from './application/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './application/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { BloggerBlogsService } from './application/blogger.blogs.service';
import { CreatePostUseCase } from './application/use-cases/create-post-use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post-use-case';
import { IsBlogExistConstraint } from '../../main/decorators/is-blog-exist.decorator';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];

@Module({
  imports: [BlogsModule, PostsModule, CqrsModule, UsersModule, CommentsModule],
  controllers: [BloggerBlogsController],
  providers: [...useCases, BloggerBlogsService, IsBlogExistConstraint],
  exports: [IsBlogExistConstraint],
})
export class BloggerBlogsModule {}
