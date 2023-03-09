import { BlogsQueryRepo } from './infrastructure/blogs.queryRepo';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { Blog } from './domain/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

const entities = [Blog];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [BlogsQueryRepo, BlogsRepository],
  exports: [BlogsQueryRepo, BlogsRepository],
})
export class BlogsModule {}
