import { Module } from '@nestjs/common';
import { PublicBlogsController } from './api/public.blogs.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BlogsModule, PostsModule, AuthModule],
  controllers: [PublicBlogsController],
})
export class PublicBlogsModule {}
