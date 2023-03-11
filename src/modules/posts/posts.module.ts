import { PostLike } from './domain/postLike.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikePostUseCase } from './application/use-cases/like-post-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { PostsQueryRepo } from './infrastructure/posts.queryRepo';
import { PostsRepository } from './infrastructure/posts.repository';
import { Post } from './domain/post.entity';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CreateCommentUseCase } from './application/use-cases/create-comment-use-case';
import { BloggerUsersModule } from '../blogger.users/blogger.users.module';
import { CommentsModule } from '../comments/comments.module';
import { ApiJwtModule } from '../api-jwt/api-jwt.module';

const useCases = [LikePostUseCase, CreateCommentUseCase];

const entities = [Post, PostLike];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    CqrsModule,
    BloggerUsersModule,
    UsersModule,
    CommentsModule,
    ApiJwtModule,
  ],
  controllers: [PostsController],
  providers: [PostsQueryRepo, PostsRepository, ...useCases],
  exports: [PostsQueryRepo, PostsRepository],
})
export class PostsModule {}
