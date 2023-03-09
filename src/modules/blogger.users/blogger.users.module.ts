import { Module } from '@nestjs/common';
import { BloggerUsersController } from './api/blogger.users.controller';
import { BloggerUsersQueryRepo } from './infrastructure/blogger.users.queryRepo';
import { UsersModule } from '../users/users.module';
import { BannedUserForBlog } from './domain/banned-user-for-blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanUserForBlogByBloggerUseCase } from './application/use-cases/ban-user-for-blog-by-blogger-use-case';
import { BloggerUsersRepository } from './infrastructure/blogger.users.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CqrsModule } from '@nestjs/cqrs';

const useCases = [BanUserForBlogByBloggerUseCase];
const entities = [BannedUserForBlog];

@Module({
  imports: [TypeOrmModule.forFeature(entities), UsersModule, BlogsModule, CqrsModule],
  controllers: [BloggerUsersController],
  providers: [BloggerUsersRepository, BloggerUsersQueryRepo, ...useCases],
  exports: [BloggerUsersRepository],
})
export class BloggerUsersModule {}
