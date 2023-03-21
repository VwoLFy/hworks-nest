import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUserForBlog } from '../domain/banned-user-for-blog.entity';

@Injectable()
export class BloggerUsersRepository {
  constructor(
    @InjectRepository(BannedUserForBlog) private readonly bannedUsersForBlogRepositoryT: Repository<BannedUserForBlog>,
  ) {}

  async findBannedUserForBlog(blogId: string, userId: string): Promise<BannedUserForBlog | null> {
    const foundBannedUser = await this.bannedUsersForBlogRepositoryT.findOne({
      where: { userId: userId, blogId: blogId },
    });

    return foundBannedUser ?? null;
  }

  async saveBannedUserForBlog(bannedUserForBlog: BannedUserForBlog) {
    await this.bannedUsersForBlogRepositoryT.save(bannedUserForBlog);
  }

  async deleteBannedUserForBlog(userId: string, blogId: string) {
    await this.bannedUsersForBlogRepositoryT.delete({ blogId: blogId, userId: userId });
  }
}
