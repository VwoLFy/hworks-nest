import { Module } from '@nestjs/common';
import { AppController } from './_Test/app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsQueryRepo } from './blogs/infrastructure/blogs.queryRepo';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use-case';
import { BlogsController } from './blogs/api/blogs.controller';
import { Post, PostSchema } from './posts/domain/post.schema';
import { PostsQueryRepo } from './posts/infrastructure/posts.queryRepo';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostLike, PostLikeSchema } from './posts/domain/postLike.schema';
import { LikePostUseCase } from './posts/application/use-cases/like-post-use-case';
import { PostsController } from './posts/api/posts.controller';
import { CommentLike, CommentLikeSchema } from './comments/domain/commentLike.schema';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { CommentsQueryRepo } from './comments/infrastructure/comments.queryRepo';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsController } from './comments/api/comments.controller';
import { User, UserSchema } from './users/domain/user.schema';
import { UsersQueryRepo } from './users/infrastructure/users.queryRepo';
import { UsersRepository } from './users/infrastructure/users.repository';
import { CreateUserUseCase } from './users/application/use-cases/create-user-use-case';
import { UsersController } from './users/api/users.controller';
import { DeleteAllController } from './delete_all/delete-all.controller';
import { AttemptsData, AttemptsDataSchema } from './auth/domain/attempts.schema';
import { PasswordRecovery, PasswordRecoverySchema } from './auth/domain/password-recovery.schema';
import { CountAttemptsUseCase } from './auth/application/use-cases/count-attempts-use-case';
import { AttemptsRepository } from './auth/infrastructure/attempts.repository';
import { AuthService } from './auth/application/auth.service';
import { EmailService } from './auth/application/email.service';
import { ApiJwtService } from './auth/application/api-jwt.service';
import { PasswordRecoveryRepository } from './auth/infrastructure/password-recovery.repository';
import { AuthController } from './auth/api/auth.controller';
import { DeleteSessionsExceptCurrentUseCase } from './security/application/use-cases/delete-sessions-except-current-use-case';
import { SecurityRepository } from './security/infrastructure/security.repository';
import { SecurityQueryRepo } from './security/infrastructure/security.queryRepo';
import { SecurityController } from './security/api/security.controller';
import { Session, SessionSchema } from './security/domain/session.schema';
import { JwtModule } from '@nestjs/jwt';
import { IsBlogExistConstraint } from './main/decorators/is-blog-exist.decorator';
import { IsFreeLoginOrEmailConstraint } from './main/decorators/is-free-login-or-email.decorator';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailAdapter } from './auth/infrastructure/email.adapter';
import { ApiConfigService } from './main/configuration/api.config.service';
import { ApiConfigModule } from './main/configuration/api.config.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './main/configuration/configuration';
import Joi from 'joi';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/api/strategies/local.strategy';
import { JwtStrategy } from './auth/api/strategies/jwt.strategy';
import { BasicStrategy } from './auth/api/strategies/basic.strategy';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog-use-case';
import { DeleteAllUseCase } from './delete_all/delete-all-use-case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post-use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post-use-case';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment-use-case';
import { LikeCommentUseCase } from './comments/application/use-cases/like-comment-use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment-use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user-use-case';
import { ChangePasswordUseCase } from './auth/application/use-cases/change-password-use-case';
import { GetDataIfSessionIsActiveUseCase } from './security/application/use-cases/get-data-if-session-is-active-use-case';
import { CheckCredentialsOfUserUseCase } from './auth/application/use-cases/check-credentials-of-user-use-case';
import { ConfirmEmailUseCase } from './auth/application/use-cases/confirm-email-use-case';
import { CreateSessionUseCase } from './security/application/use-cases/create-session-use-case';
import { DeleteSessionUseCase } from './security/application/use-cases/delete-session-use-case';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user-use-case';
import { ResendRegistrationEmailUseCase } from './auth/application/use-cases/resend-registration-email-use-case';
import { SendPasswordRecoveryEmailUseCase } from './auth/application/use-cases/send-password-recovery-email-use-case';
import { UpdateSessionUseCase } from './security/application/use-cases/update-session-use-case';
import { GetUserIdByAccessTokenUseCase } from './auth/application/use-cases/get-user-id-by-accesstoken-use-case';

const useCases = [
  DeleteAllUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  LikePostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  LikeCommentUseCase,
  DeleteCommentUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  ChangePasswordUseCase,
  CheckCredentialsOfUserUseCase,
  ConfirmEmailUseCase,
  CountAttemptsUseCase,
  GetUserIdByAccessTokenUseCase,
  RegisterUserUseCase,
  ResendRegistrationEmailUseCase,
  SendPasswordRecoveryEmailUseCase,
  CreateSessionUseCase,
  DeleteSessionUseCase,
  DeleteSessionsExceptCurrentUseCase,
  UpdateSessionUseCase,
  GetDataIfSessionIsActiveUseCase,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],

      validationSchema: Joi.object({
        //NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
        PORT: Joi.number(),

        JWT_SECRET_FOR_ACCESSTOKEN: Joi.string().required(),
        EXPIRES_IN_TIME_OF_ACCESSTOKEN: Joi.string().required(),
        JWT_SECRET_FOR_REFRESHTOKEN: Joi.string().required(),
        EXPIRES_IN_TIME_OF_REFRESHTOKEN: Joi.string().required(),

        SA_LOGIN: Joi.string().required(),
        SA_PASSWORD: Joi.string().required(),

        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL: Joi.string().email().required(),
        EMAIL_FROM: Joi.string().required(),
        MY_EMAIL: Joi.string().email().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        const uri = apiConfigService.MONGO_URI;
        const dbName = 'Homework';
        return { uri, dbName };
      },
    }),
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
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        const user = apiConfigService.EMAIL;
        const pass = apiConfigService.EMAIL_PASSWORD;
        const sender = apiConfigService.EMAIL_FROM;
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
          },
          defaults: {
            from: `${sender} <${user}>`,
          },
          template: {
            dir: __dirname + '/auth/application/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          secret: apiConfigService.JWT_SECRET_FOR_ACCESSTOKEN,
          signOptions: { expiresIn: apiConfigService.EXPIRES_IN_TIME_OF_ACCESSTOKEN },
        };
      },
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
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    IsBlogExistConstraint,
    IsFreeLoginOrEmailConstraint,
    BlogsQueryRepo,
    BlogsRepository,
    PostsQueryRepo,
    PostsRepository,
    CommentsQueryRepo,
    CommentsRepository,
    UsersQueryRepo,
    UsersRepository,
    AttemptsRepository,
    AuthService,
    EmailService,
    EmailAdapter,
    ApiJwtService,
    PasswordRecoveryRepository,
    SecurityRepository,
    SecurityQueryRepo,
    ApiConfigService,
    ...useCases,
  ],
})
export class AppModule {}
