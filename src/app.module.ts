import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsQueryRepo } from './blogs/infrastructure/blogs-queryRepo';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import { BlogsRepository } from './blogs/infrastructure/blogs-repository';
import { BlogsService } from './blogs/application/blogs-service';
import { BlogsController } from './blogs/api/blogs-controller';

const mongoUri = 'mongodb://0.0.0.0:27017/';
const dbName = 'Homework';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri, { dbName }),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogsQueryRepo, BlogsRepository, BlogsService],
})
export class AppModule {}
