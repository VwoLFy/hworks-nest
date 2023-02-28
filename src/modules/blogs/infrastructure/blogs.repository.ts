import { Blog } from '../domain/blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogFromDB } from './types/BlogFromDB';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogById(blogId: string): Promise<Blog | null> {
    const blogFromDB: BlogFromDB = (
      await this.dataSource.query(`SELECT * FROM public."Blogs" WHERE id = $1`, [blogId])
    )[0];

    if (!blogFromDB) return null;
    return Blog.createBlogFromDB(blogFromDB);
  }

  async saveBlog(blog: Blog) {
    await this.dataSource.query(
      `INSERT INTO public."Blogs"("id", "name", "description", "websiteUrl", "createdAt", "isMembership", "userId", "userLogin", "isBanned", "banDate")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`,
      [
        blog.id,
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.createdAt,
        blog.isMembership,
        blog.userId,
        blog.userLogin,
        blog.isBanned,
        blog.banDate,
      ],
    );
  }

  async deleteBlog(blogId: string) {
    await this.dataSource.query(`DELETE FROM public."Blogs" WHERE id = $1`, [blogId]);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
  }

  async updateBlog(blog: Blog) {
    await this.dataSource.query(
      `UPDATE public."Blogs" 
            SET "name"=$1, "description"=$2, "websiteUrl"=$3
            WHERE "id" = $4`,
      [blog.name, blog.description, blog.websiteUrl, blog.id],
    );
  }

  async updateBanBlogInfo(blog: Blog) {
    await this.dataSource.query(
      `UPDATE public."Blogs" 
            SET "isBanned"=$1, "banDate"=$2
            WHERE "id" = $3`,
      [blog.isBanned, blog.banDate, blog.id],
    );
  }

  async updateBlogOwner(blog: Blog) {
    await this.dataSource.query(
      `UPDATE public."Blogs" 
            SET "userId"=$1, "userLogin"=$2
            WHERE "id" = $3`,
      [blog.userId, blog.userLogin, blog.id],
    );
  }
}
