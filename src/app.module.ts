import { Module } from '@nestjs/common';
import { AppController } from './_Test/app.controller';
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
import { CommentLike, CommentLikeSchema } from './comments/domain/commentLike.schema';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { CommentsQueryRepo } from './comments/infrastructure/comments-queryRepo';
import { CommentsRepository } from './comments/infrastructure/comments-repository';
import { CommentsService } from './comments/application/comments-service';
import { CommentsController } from './comments/api/comments-controller';
import { User, UserSchema } from './users/domain/user.schema';
import { UsersQueryRepo } from './users/infrastructure/users-queryRepo';
import { UsersRepository } from './users/infrastructure/users-repository';
import { UsersService } from './users/application/user-service';
import { UsersController } from './users/api/users-controller';
import { DeleteAllController } from './delete_all/delete_all.controller';
import { ConfigModule } from '@nestjs/config';
import { AttemptsData, AttemptsDataSchema } from './auth/domain/attempts.schema';
import { PasswordRecovery, PasswordRecoverySchema } from './auth/domain/password-recovery.schema';
import { AttemptsService } from './auth/application/attempts-service';
import { AttemptsRepository } from './auth/infrastructure/attempts-repository';
import { AuthService } from './auth/application/auth-service';
import { EmailService } from './auth/application/email.service';
import { AppJwtService } from './auth/application/jwt-service';
import { PasswordRecoveryRepository } from './auth/infrastructure/password-recovery-repository';
import { AuthController } from './auth/api/auth-controller';
import { SecurityService } from './security/application/security-service';
import { SecurityRepository } from './security/infrastructure/security-repository';
import { SecurityQueryRepo } from './security/infrastructure/security-queryRepo';
import { SecurityController } from './security/api/security-controller';
import { Session, SessionSchema } from './security/domain/session.schema';
import { JwtService } from '@nestjs/jwt';
import { IsBlogExistConstraint } from './main/Decorators/IsBlogExistDecorator';
import { IsFreeLoginOrEmailConstraint } from './main/Decorators/IsFreeLoginOrEmailDecorator';
import { IsConfirmCodeValidConstraint } from './main/Decorators/IsConfirmCodeValidDecorator';
import { IsEmailValidForConfirmConstraint } from './main/Decorators/IsEmailValidForConfirmDecorator';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { settings } from './main/settings';
import { EmailAdapter } from './auth/infrastructure/email-adapter';

const dbName = 'Homework';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGOURI, { dbName }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: User.name, schema: UserSchema },
      { name: AttemptsData.name, schema: AttemptsDataSchema },
      { name: PasswordRecovery.name, schema: PasswordRecoverySchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: `${settings.EMAIL_FROM} <${settings.E_MAIL}>`,
        },
        template: {
          dir: __dirname + '/auth/application/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    DeleteAllController,
    AuthController,
    SecurityController,
  ],
  providers: [
    IsConfirmCodeValidConstraint,
    IsEmailValidForConfirmConstraint,
    IsBlogExistConstraint,
    IsFreeLoginOrEmailConstraint,
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
    AttemptsService,
    AttemptsRepository,
    AuthService,
    EmailService,
    EmailAdapter,
    AppJwtService,
    PasswordRecoveryRepository,
    SecurityService,
    SecurityRepository,
    SecurityQueryRepo,
    JwtService,
  ],
})
export class AppModule {}
