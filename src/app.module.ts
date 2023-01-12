import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsQueryRepo } from './blogs/infrastructure/blogs-queryRepo';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import { BlogsRepository } from './blogs/infrastructure/blogs-repository';
import { BlogsService } from './blogs/application/blogs-service';
import { BlogsController } from './blogs/api/blogs-controller';
import { Post, PostSchema } from './posts/domain/post.schema';
import { PostsQueryRepo } from './posts/infrastructure/posts-queryRepo';
import { PostsRepository } from './posts/infrastructure/posts-repository';
import { PostLike, PostLikeSchema } from './posts/domain/postLike.schema';
import { PostsService } from './posts/application/posts-service';
import { PostsController } from './posts/api/posts-controller';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/commentLike.schema';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { CommentsQueryRepo } from './comments/infrastructure/comments-queryRepo';
import { CommentsRepository } from './comments/infrastructure/comments-repository';
import { CommentsService } from './comments/application/comments-service';
import { CommentsController } from './comments/api/comments-controller';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
  User,
  AccountData,
  UserAccountSchema,
  UserSchema,
} from './users/domain/user.schema';
import { UsersQueryRepo } from './users/infrastructure/users-queryRepo';
import { UsersRepository } from './users/infrastructure/users-repository';
import { UsersService } from './users/application/user-service';
import { UsersController } from './users/api/users-controller';

const mongoUri = 'mongodb://0.0.0.0:27017/';
const dbName = 'Homework';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri, { dbName }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: AccountData.name, schema: UserAccountSchema },
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    AppService,
    BlogsQueryRepo,
    BlogsRepository,
    BlogsService,
    PostsQueryRepo,
    PostsRepository,
    PostsService,
    CommentsQueryRepo,
    CommentsRepository,
    CommentsService,
    UsersQueryRepo,
    UsersRepository,
    UsersService,
  ],
})
export class AppModule {}
