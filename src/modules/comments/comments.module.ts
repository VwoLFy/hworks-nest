import { CommentsRepository } from './infrastructure/comments.repository';
import { UsersModule } from '../users/users.module';
import { LikeCommentUseCase } from './application/use-cases/like-comment-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './api/comments.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentUseCase } from './application/use-cases/update-comment-use-case';
import { CommentLike } from './domain/commentLike.entity';
import { CommentsService } from './application/comments.service';
import { CommentsQueryRepo } from './infrastructure/comments.queryRepo';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment-use-case';
import { Module } from '@nestjs/common';
import { Comment } from './domain/comment.entity';
import { Post } from '../posts/domain/post.entity';
import { AuthModule } from '../auth/auth.module';

const useCases = [UpdateCommentUseCase, LikeCommentUseCase, DeleteCommentUseCase];

const entities = [Comment, CommentLike, Post];

@Module({
  imports: [TypeOrmModule.forFeature(entities), CqrsModule, UsersModule, AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsQueryRepo, CommentsRepository, ...useCases],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepo],
})
export class CommentsModule {}
