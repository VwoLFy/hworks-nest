import { Module } from '@nestjs/common';
import { AppController } from './_Test/app.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ApiConfigService } from './main/configuration/api.config.service';
import { ApiConfigModule } from './main/configuration/api.config.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './main/configuration/configuration';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { AuthModule } from './modules/auth/auth.module';
import { BloggerUsersModule } from './modules/blogger.users/blogger.users.module';
import { DeleteAllModule } from './modules/delete-all/delete-all.module';
import { SaUsersModule } from './modules/sa.users/sa.users.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PostsModule } from './modules/posts/posts.module';
import { SaBlogsModule } from './modules/sa.blogs/sa.blogs.module';
import { PublicBlogsModule } from './modules/public.blogs/public.blogs.module';
import { BloggerBlogsModule } from './modules/blogger.blogs/blogger.blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],

      validationSchema: Joi.object({
        //NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
        PORT: Joi.number(),

        TYPEORM_USERNAME: Joi.string().required(),
        TYPEORM_PASSWORD: Joi.string().required(),

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

        IP_RESTRICTION: Joi.boolean(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          type: 'postgres',
          host: apiConfigService.TYPEORM_HOST,
          port: apiConfigService.TYPEORM_PORT,
          username: apiConfigService.TYPEORM_USERNAME,
          password: apiConfigService.TYPEORM_PASSWORD,
          database: apiConfigService.TYPEORM_DATABASE,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
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
            dir: __dirname + '/modules/auth/application/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    BlogsModule,
    UsersModule,
    AuthModule,
    BloggerUsersModule,
    DeleteAllModule,
    SaUsersModule,
    CommentsModule,
    PostsModule,
    SaBlogsModule,
    PublicBlogsModule,
    BloggerBlogsModule,
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
