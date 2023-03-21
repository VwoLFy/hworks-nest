import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsControllerSA } from './api/sa.blogs.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { BanBlogUseCase } from './application/use-cases/ban-blog-use-case';
import { BindBlogWithUserUseCase } from './application/use-cases/bind-blog-with-user-use-case';
import { UsersModule } from '../users/users.module';

const useCases = [BanBlogUseCase, BindBlogWithUserUseCase];

@Module({
  imports: [CqrsModule, BlogsModule, UsersModule],
  controllers: [BlogsControllerSA],
  providers: [...useCases],
})
export class SaBlogsModule {}
