import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BannedUserForBlog } from '../domain/banned-user-for-blog.entity';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindBannedUsersForBlogQueryModel } from '../api/models/FindBannedUsersForBlogQueryModel';
import { BannedUserForBlogViewModel } from '../api/models/BannedUserForBlogViewModel';

@Injectable()
export class BloggerUsersQueryRepo {
  constructor(
    @InjectRepository(BannedUserForBlog) private readonly bannedUsersForBlogRepositoryT: Repository<BannedUserForBlog>,
  ) {}

  async findBannedUsersForBlog(
    blogId: string,
    dto: FindBannedUsersForBlogQueryModel,
  ): Promise<PageViewModel<BannedUserForBlogViewModel>> {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const [foundUsers, totalCount] = await this.bannedUsersForBlogRepositoryT.findAndCount({
      where: { blogId: blogId, userLogin: ILike(`%${searchLoginTerm}%`) },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = foundUsers.map((u) => new BannedUserForBlogViewModel(u));
    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }
}
