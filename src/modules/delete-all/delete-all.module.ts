import { Module } from '@nestjs/common';
import { DeleteAllController } from './delete-all.controller';
import { DeleteAllUseCase } from './delete-all-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../blogs/blogs.module';
import { UsersModule } from '../users/users.module';
import { BloggerUsersModule } from '../blogger.users/blogger.users.module';
import { AuthModule } from '../auth/auth.module';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [CqrsModule, BlogsModule, UsersModule, BloggerUsersModule, AuthModule, CommentsModule, PostsModule],
  controllers: [DeleteAllController],
  providers: [DeleteAllUseCase],
})
export class DeleteAllModule {}
