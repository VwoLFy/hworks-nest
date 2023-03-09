import { Module } from '@nestjs/common';
import { PublicBlogsController } from './api/public.blogs.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { ApiJwtModule } from '../api-jwt/api-jwt.module';

@Module({
  imports: [BlogsModule, PostsModule, ApiJwtModule],
  controllers: [PublicBlogsController],
})
export class PublicBlogsModule {}
